<?php

namespace App\Services\Picking\DTO;

final readonly class AvailableOrdersFilters
{
    public function __construct(
        public ?string $status,
        public ?string $search,
        public int $page,
        public int $perPage,
        public bool $forceRefresh
    ) {}

    public static function fromArray(array $filters): self
    {
        $status = isset($filters['status']) ? trim((string) $filters['status']) : null;
        $search = isset($filters['search']) ? trim((string) $filters['search']) : null;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = max(1, min((int) ($filters['per_page'] ?? 20), 100));
        $forceRefresh = (bool) ($filters['force_refresh'] ?? false);

        return new self(
            status: $status !== '' ? $status : null,
            search: $search !== '' ? $search : null,
            page: $page,
            perPage: $perPage,
            forceRefresh: $forceRefresh
        );
    }
}
