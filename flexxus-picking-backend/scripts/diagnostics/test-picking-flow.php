<?php

/**
 * PRUEBA DE FLUJO DE PICKING POR DEPÓSITO
 *
 * Esta prueba demuestra el flujo completo de obtención y filtrado
 * de pedidos de picking usando la API de Flexxus.
 *
 * @author: Equipo de Desarrollo
 *
 * @date: 2026-03-02
 *
 * @version: 1.0
 */

// ========================================
// CONFIGURACIÓN
// ========================================
$config = [
    'flexxus' => [
        'base_url' => 'https://pruebagiliycia.procomisp.com.ar',
        'username' => 'CARLOSR',
        'password' => 'W250',
        'deviceinfo' => [
            'model' => '0',
            'platform' => '0',
            'uuid' => '4953457348957348957348975',
            'version' => '0',
            'manufacturer' => '0',
        ],
    ],
    'test' => [
        'date' => '2026-03-02',
        'warehouse' => 'RONDEAU',
    ],
];

// ========================================
// FUNCIONES DE API
// ========================================

/**
 * PASO 1: Login a Flexxus
 * POST /v2/auth/login
 *
 * NOTA: deviceinfo debe ser un string JSON, no un objeto
 *
 * @param  array  $config  Configuración de la aplicación
 * @return array Token y datos del warehouse
 */
function loginToFlexxus($config)
{
    $url = $config['flexxus']['base_url'].'/v2/auth/login';

    // IMPORTANTE: deviceinfo debe ser un string JSON
    $payload = [
        'username' => $config['flexxus']['username'],
        'password' => $config['flexxus']['password'],
        'deviceinfo' => json_encode($config['flexxus']['deviceinfo']),
    ];

    $response = makeRequest('POST', $url, $payload);

    return [
        'token' => $response['token'],
        'warehouse_id' => $response['user']['warehouse_id'],
        'warehouse_name' => $response['user']['warehouse_name'],
    ];
}

/**
 * PASO 2: Obtener pedidos por fecha
 * GET /v2/orders?date_from=X&date_to=X
 *
 * @param  string  $token  Token de autenticación
 * @param  string  $baseUrl  URL base de Flexxus
 * @param  string  $date  Fecha a consultar (YYYY-MM-DD)
 * @return array Lista de pedidos
 */
function getOrdersByDate($token, $baseUrl, $date)
{
    $url = $baseUrl.'/v2/orders';
    $params = [
        'date_from' => $date,
        'date_to' => $date,
    ];

    $response = makeRequest('GET', $url.'?'.http_build_query($params), [], $token);

    return $response['data'];
}

/**
 * PASO 3: Filtrar por depósito (local)
 *
 * @param  array  $orders  Lista de pedidos
 * @param  string  $warehouseName  Nombre del depósito
 * @return array Pedidos filtrados
 */
function filterByWarehouse($orders, $warehouseName)
{
    return array_filter($orders, function ($order) use ($warehouseName) {
        return $order['DEPOSITO'] === $warehouseName && $order['ENTREGAR'] == 0;
    });
}

/**
 * PASO 4: Filtrar por EXPEDICION
 * GET /v2/deliverydata/NP/{id}
 *
 * @param  array  $orders  Lista de pedidos
 * @param  string  $token  Token de autenticación
 * @param  string  $baseUrl  URL base de Flexxus
 * @return array Pedidos de expedición
 */
function filterByExpedition($orders, $token, $baseUrl)
{
    $expeditionOrders = [];

    foreach ($orders as $order) {
        $url = $baseUrl.'/v2/deliverydata/NP/'.$order['NUMEROCOMPROBANTE'];
        $deliveryData = makeRequest('GET', $url, [], $token);

        if ($deliveryData['data']['CODIGOTIPOENTREGA'] == 1) {
            $order['delivery_info'] = $deliveryData['data'];
            $expeditionOrders[] = $order;
        }
    }

    return $expeditionOrders;
}

/**
 * PASO 5: Obtener detalles completos
 * GET /v2/orders/NP/{id}
 *
 * @param  string  $token  Token de autenticación
 * @param  string  $baseUrl  URL base de Flexxus
 * @param  int  $orderNumber  Número de pedido
 * @return array Detalles del pedido
 */
function getOrderDetails($token, $baseUrl, $orderNumber)
{
    $url = $baseUrl.'/v2/orders/NP/'.$orderNumber;
    $response = makeRequest('GET', $url, [], $token);

    return $response['data'];
}

/**
 * Función auxiliar para hacer requests HTTP
 *
 * @param  string  $method  Método HTTP (GET, POST)
 * @param  string  $url  URL completa
 * @param  array  $payload  Datos a enviar (POST)
 * @param  string  $token  Token de autenticación
 * @return array Respuesta decodificada
 *
 * @throws Exception Si hay error HTTP
 */
function makeRequest($method, $url, $payload = [], $token = null)
{
    $headers = ['Content-Type: application/json'];

    if ($token) {
        $headers[] = 'Authorization: Bearer '.$token;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Error cURL: {$curlError}");
    }

    if ($httpCode !== 200) {
        throw new Exception("HTTP {$httpCode}: {$response}");
    }

    $decoded = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error decodificando JSON: '.json_last_error_msg());
    }

    return $decoded;
}

/**
 * Mostrar resultados formateados
 *
 * @param  array  $orders  Lista de pedidos
 * @param  string  $token  Token de autenticación
 * @param  string  $baseUrl  URL base de Flexxus
 */
function displayPickingList($orders, $token, $baseUrl)
{
    echo "\n".str_repeat('=', 70)."\n";
    echo "📋 LISTA DE PICKING - EXPEDICION\n";
    echo str_repeat('=', 70)."\n\n";

    foreach ($orders as $index => $order) {
        $details = getOrderDetails($token, $baseUrl, $order['NUMEROCOMPROBANTE']);

        echo '📦 PEDIDO #'.($index + 1)."\n";
        echo str_repeat('-', 70)."\n";
        echo "Número: NP {$order['NUMEROCOMPROBANTE']}\n";
        echo "Cliente: {$order['RAZONSOCIAL']}\n";
        echo 'Fecha: '.date('d/m/Y', strtotime($order['FECHACOMPROBANTE']))."\n";
        echo "Depósito: {$order['DEPOSITO']}\n";
        echo 'Total: $'.number_format($order['TOTAL'], 2)."\n";
        echo "Tipo Entrega: EXPEDICION (Retiro en sucursal)\n\n";

        echo "📦 ITEMS A PREPARAR:\n";
        echo str_repeat('-', 70)."\n";

        foreach ($details['DETALLE'] as $item) {
            echo "\n  ➤ {$item['DESCRIPCION']}\n";
            echo "     Cód: {$item['CODIGOPARTICULAR']}\n";
            echo "     Cantidad: {$item['CANTIDAD']}\n";
            echo "     Pendiente: {$item['PENDIENTE']}\n";
            echo "     Remitido: {$item['CANTIDADREMITIDA']}\n";
            echo '     Precio Unit.: $'.number_format($item['PRECIOUNITARIO'], 2)."\n";
            echo '     Subtotal: $'.number_format($item['PRECIOTOTAL'], 2)."\n";
        }

        echo "\n".str_repeat('=', 70)."\n\n";
    }
}

// ========================================
// EJECUCIÓN PRINCIPAL
// ========================================

try {
    echo "🚀 INICIANDO PRUEBA DE FLUJO DE PICKING\n";
    echo str_repeat('=', 70)."\n";
    echo "Fecha de prueba: {$config['test']['date']}\n";
    echo "Depósito objetivo: {$config['test']['warehouse']}\n";
    echo str_repeat('=', 70)."\n\n";

    // PASO 1: LOGIN
    echo "⏳ PASO 1: Autenticando con Flexxus...\n";
    $auth = loginToFlexxus($config);
    echo "✅ Login exitoso\n";
    echo "   Usuario: {$config['flexxus']['username']}\n";
    echo "   Depósito: {$auth['warehouse_name']} ({$auth['warehouse_id']})\n";
    echo '   Token: '.substr($auth['token'], 0, 30)."...\n\n";

    // PASO 2: OBTENER PEDIDOS
    echo "⏳ PASO 2: Obteniendo pedidos del día {$config['test']['date']}...\n";
    $allOrders = getOrdersByDate($auth['token'], $config['flexxus']['base_url'], $config['test']['date']);
    echo '✅ Se encontraron '.count($allOrders)." pedidos en total\n\n";

    // MOSTRAR TODOS LOS PEDIDOS (para debug)
    echo "📊 Todos los pedidos del día:\n";
    foreach ($allOrders as $order) {
        $status = $order['ENTREGAR'] == 0 ? 'Pendiente' : 'Entregado';
        echo "   - NP {$order['NUMEROCOMPROBANTE']}: {$order['DEPOSITO']} - {$order['RAZONSOCIAL']} [{$status}]\n";
    }
    echo "\n";

    // PASO 3: FILTRAR POR DEPÓSITO
    echo "⏳ PASO 3: Filtrando por depósito {$config['test']['warehouse']}...\n";
    $warehouseOrders = filterByWarehouse($allOrders, $config['test']['warehouse']);
    $warehouseOrders = array_values($warehouseOrders); // Reindexar array
    echo '✅ '.count($warehouseOrders)." pedidos de {$config['test']['warehouse']}\n\n";

    // PASO 4: FILTRAR POR EXPEDICION
    echo "⏳ PASO 4: Filtrando por EXPEDICION (retiro en sucursal)...\n";
    $expeditionOrders = filterByExpedition($warehouseOrders, $auth['token'], $config['flexxus']['base_url']);
    echo '✅ '.count($expeditionOrders)." pedidos de EXPEDICION\n\n";

    // PASO 5: MOSTRAR DETALLES
    if (count($expeditionOrders) > 0) {
        displayPickingList($expeditionOrders, $auth['token'], $config['flexxus']['base_url']);

        echo "✅ PRUEBA COMPLETADA CON ÉXITO\n";
        echo '   Se encontraron '.count($expeditionOrders)." pedidos de picking para {$config['test']['warehouse']}\n";
        echo "   Fecha: {$config['test']['date']}\n";
        echo "   Tipo: EXPEDICION (retiro en sucursal)\n\n";

        // RESUMEN DE ITEMS
        echo "📊 RESUMEN:\n";
        echo str_repeat('=', 70)."\n";
        $totalItems = 0;
        $totalAmount = 0;

        foreach ($expeditionOrders as $order) {
            $details = getOrderDetails($auth['token'], $config['flexxus']['base_url'], $order['NUMEROCOMPROBANTE']);
            $totalItems += count($details['DETALLE']);
            $totalAmount += $order['TOTAL'];
        }

        echo 'Total de pedidos: '.count($expeditionOrders)."\n";
        echo "Total de items: {$totalItems}\n";
        echo 'Monto total: $'.number_format($totalAmount, 2)."\n";
        echo str_repeat('=', 70)."\n";

    } else {
        echo "⚠️  No se encontraron pedidos de EXPEDICION para {$config['test']['warehouse']}\n";
        echo "   en la fecha {$config['test']['date']}\n\n";

        if (count($warehouseOrders) > 0) {
            echo 'ℹ️  Se encontraron '.count($warehouseOrders)." pedidos de {$config['test']['warehouse']},\n";
            echo "   pero ninguno es de tipo EXPEDICION (retiro en sucursal).\n";
            echo "   Pueden ser de REPARTO (delivery) o otro tipo de entrega.\n";
        }
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo "\n🔍 SOLUCIONES POSIBLES:\n";
    echo "   1. Verificar la conexión a internet\n";
    echo "   2. Verificar que las credenciales sean correctas\n";
    echo "   3. Verificar que la API de Flexxus esté disponible\n";
    echo "   4. Revisar el mensaje de error para más detalles\n";
    exit(1);
}
