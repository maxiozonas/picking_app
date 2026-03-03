<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class PickingOrderCollection extends ResourceCollection
{
    public function toArray($request)
    {
        return $this->collection->map(fn ($item) => new PickingOrderResource($item))->toArray($request);
    }
}
