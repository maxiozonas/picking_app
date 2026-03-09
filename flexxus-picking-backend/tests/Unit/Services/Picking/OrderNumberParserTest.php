<?php

namespace Tests\Unit\Services\Picking;

use App\Services\Picking\OrderNumberParser;
use Tests\TestCase;

class OrderNumberParserTest extends TestCase
{
    public function test_parse_numeric_only_order_number(): void
    {
        $input = '623200';

        $result = OrderNumberParser::parse($input);

        $this->assertEquals('NP', $result['order_type']);
        $this->assertEquals('623200', $result['order_number']);
        $this->assertEquals('NP 623200', $result['canonical_key']);
        $this->assertEquals('NP 623200', $result['display_number']);
    }

    public function test_parse_prefixed_with_space_order_number(): void
    {
        $input = 'NP 623200';

        $result = OrderNumberParser::parse($input);

        $this->assertEquals('NP', $result['order_type']);
        $this->assertEquals('623200', $result['order_number']);
        $this->assertEquals('NP 623200', $result['canonical_key']);
        $this->assertEquals('NP 623200', $result['display_number']);
    }

    public function test_parse_prefixed_with_hyphen_order_number(): void
    {
        $input = 'NP-623200';

        $result = OrderNumberParser::parse($input);

        $this->assertEquals('NP', $result['order_type']);
        $this->assertEquals('623200', $result['order_number']);
        $this->assertEquals('NP 623200', $result['canonical_key']);
        $this->assertEquals('NP-623200', $result['display_number']);
    }

    public function test_parse_lower_case_prefix(): void
    {
        $input = 'np-623200';

        $result = OrderNumberParser::parse($input);

        $this->assertEquals('NP', $result['order_type']);
        $this->assertEquals('623200', $result['order_number']);
        $this->assertEquals('NP 623200', $result['canonical_key']);
    }

    public function test_parse_preserves_original_format_in_display_number(): void
    {
        $numericOnly = OrderNumberParser::parse('623200');
        $spacePrefixed = OrderNumberParser::parse('NP 623200');
        $hyphenPrefixed = OrderNumberParser::parse('NP-623200');

        $this->assertEquals('NP 623200', $numericOnly['display_number']);
        $this->assertEquals('NP 623200', $spacePrefixed['display_number']);
        $this->assertEquals('NP-623200', $hyphenPrefixed['display_number']);
    }

    public function test_extract_numeric_part_returns_correct_number(): void
    {
        $this->assertEquals('623200', OrderNumberParser::extractNumeric('623200'));
        $this->assertEquals('623200', OrderNumberParser::extractNumeric('NP 623200'));
        $this->assertEquals('623200', OrderNumberParser::extractNumeric('NP-623200'));
    }

    public function test_extract_numeric_part_throws_on_invalid_format(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid order number format');

        OrderNumberParser::extractNumeric('INVALID');
    }

    public function test_build_canonical_key_returns_consistent_format(): void
    {
        $key1 = OrderNumberParser::buildCanonicalKey('NP', '623200');
        $key2 = OrderNumberParser::buildCanonicalKey('NP', '623200');

        $this->assertEquals('NP 623200', $key1);
        $this->assertEquals($key1, $key2);
    }

    public function test_normalize_input_adds_np_prefix_to_numeric_only(): void
    {
        $result = OrderNumberParser::normalize('623200');

        $this->assertEquals('NP 623200', $result);
    }

    public function test_normalize_input_preserves_existing_prefix(): void
    {
        $spaceResult = OrderNumberParser::normalize('NP 623200');
        $hyphenResult = OrderNumberParser::normalize('NP-623200');

        $this->assertEquals('NP 623200', $spaceResult);
        $this->assertEquals('NP 623200', $hyphenResult);
    }

    public function test_parse_throws_on_empty_string(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Order number cannot be empty');

        OrderNumberParser::parse('');
    }

    public function test_parse_throws_on_null_input(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Order number cannot be empty');

        OrderNumberParser::parse(null);
    }

    public function test_is_valid_returns_true_for_valid_formats(): void
    {
        $this->assertTrue(OrderNumberParser::isValid('623200'));
        $this->assertTrue(OrderNumberParser::isValid('NP 623200'));
        $this->assertTrue(OrderNumberParser::isValid('NP-623200'));
    }

    public function test_is_valid_returns_false_for_invalid_formats(): void
    {
        $this->assertFalse(OrderNumberParser::isValid('INVALID'));
        $this->assertFalse(OrderNumberParser::isValid(''));
        $this->assertFalse(OrderNumberParser::isValid('NP ABC'));
    }
}
