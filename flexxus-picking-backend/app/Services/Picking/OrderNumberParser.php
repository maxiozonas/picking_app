<?php

namespace App\Services\Picking;

class OrderNumberParser
{
    private const DEFAULT_ORDER_TYPE = 'NP';

    private const ORDER_TYPE_PATTERN = '/^(NP|np)[\s-]?(\d+)$/';

    private const NUMERIC_ONLY_PATTERN = '/^\d+$/';

    public static function parse(?string $input): array
    {
        if (empty($input)) {
            throw new \InvalidArgumentException('Order number cannot be empty');
        }

        $trimmedInput = trim($input);
        $originalFormat = $trimmedInput;

        $matches = [];
        if (preg_match(self::ORDER_TYPE_PATTERN, $trimmedInput, $matches)) {
            $orderType = strtoupper($matches[1]);
            $orderNumber = $matches[2];
        } elseif (preg_match(self::NUMERIC_ONLY_PATTERN, $trimmedInput)) {
            $orderType = self::DEFAULT_ORDER_TYPE;
            $orderNumber = $trimmedInput;
        } else {
            throw new \InvalidArgumentException("Invalid order number format: {$trimmedInput}");
        }

        return [
            'order_type' => $orderType,
            'order_number' => $orderNumber,
            'canonical_key' => self::buildCanonicalKey($orderType, $orderNumber),
            'display_number' => self::buildDisplayNumber($originalFormat, $orderType, $orderNumber),
        ];
    }

    public static function extractNumeric(string $input): string
    {
        if (empty($input)) {
            throw new \InvalidArgumentException('Order number cannot be empty');
        }

        $trimmedInput = trim($input);

        $matches = [];
        if (preg_match(self::ORDER_TYPE_PATTERN, $trimmedInput, $matches)) {
            return $matches[2];
        } elseif (preg_match(self::NUMERIC_ONLY_PATTERN, $trimmedInput)) {
            return $trimmedInput;
        }

        throw new \InvalidArgumentException("Invalid order number format: {$trimmedInput}");
    }

    public static function buildCanonicalKey(string $orderType, string $orderNumber): string
    {
        return strtoupper($orderType).' '.$orderNumber;
    }

    public static function normalize(string $input): string
    {
        $parsed = self::parse($input);

        return $parsed['canonical_key'];
    }

    public static function isValid(?string $input): bool
    {
        if (empty($input)) {
            return false;
        }

        $trimmedInput = trim($input);

        return preg_match(self::ORDER_TYPE_PATTERN, $trimmedInput) === 1
            || preg_match(self::NUMERIC_ONLY_PATTERN, $trimmedInput) === 1;
    }

    private static function buildDisplayNumber(string $originalFormat, string $orderType, string $orderNumber): string
    {
        $trimmedOriginal = trim($originalFormat);

        if (preg_match(self::NUMERIC_ONLY_PATTERN, $trimmedOriginal)) {
            return self::buildCanonicalKey($orderType, $orderNumber);
        }

        return $trimmedOriginal;
    }
}
