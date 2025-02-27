<?php

declare(strict_types=1);

namespace AkeneoTest\Pim\Enrichment\Integration\Storage\ElasticsearchAndSql\ProductGrid;

use Akeneo\Pim\Enrichment\Component\Product\Grid\Query\FetchProductAndProductModelRowsParameters;
use Akeneo\Pim\Enrichment\Component\Product\Grid\ReadModel\Row;
use Akeneo\Pim\Enrichment\Component\Product\Model\WriteValueCollection;
use Akeneo\Pim\Enrichment\Component\Product\Value\IdentifierValue;
use Akeneo\Pim\Enrichment\Component\Product\Value\MediaValue;
use Akeneo\Test\Integration\Configuration;
use Akeneo\Test\Integration\TestCase;
use AkeneoTest\Pim\Enrichment\Integration\Storage\Sql\ProductGrid\AssertRows;
use PHPUnit\Framework\Assert;

class FetchProductAndProductModelRowsIntegration extends TestCase
{
    /**
     * {@inheritdoc}
     */
    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_fetch_product_models_from_codes()
    {
        $userId = $this
            ->get('database_connection')
            ->fetchColumn('SELECT id from oro_user where username = "admin"', [], 0);

        $fixturesLoader = $this->get('akeneo_integration_tests.loader.product_grid_fixtures_loader');
        $imagePath = $this->getFileInfoKey($this->getFixturePath('akeneo.jpg'));
        $fixtures = $fixturesLoader->createProductAndProductModels($imagePath);
        [$rootProductModel, $subProductModel] = $fixtures['product_models'];
        [$product1, $product2] = $fixtures['products'];

        $pqb = $this
            ->get('akeneo.pim.enrichment.query.product_and_product_model_query_builder_from_size_factory.with_product_identifier_cursor')
            ->create(['limit' => 10, 'with_document_type_facet' => true]);
        $query = $this->get('akeneo.pim.enrichment.product.grid.query.fetch_product_and_product_model_rows');
        $queryParameters = new FetchProductAndProductModelRowsParameters(
            $pqb,
            ['sku', 'a_localizable_image', 'a_scopable_image'],
            'ecommerce', 'en_US',
            (int) $userId
        );

        $rows = $query($queryParameters);

        $akeneoImage = current($this
            ->get('akeneo_file_storage.repository.file_info')
            ->findAll($this->getFixturePath('akeneo.jpg')));

        $expectedRows = [
            Row::fromProduct(
                'baz',
                null,
                [],
                true,
                $product2->getCreated(),
                $product2->getUpdated(),
                "[baz]",
                null,
                null,
                $product2->getUuid()->toString(),
                null,
                new WriteValueCollection([
                    IdentifierValue::value('sku', false, 'baz'),
                    MediaValue::localizableValue('a_localizable_image', $akeneoImage, 'en_US'),
                    MediaValue::scopableValue('a_scopable_image', $akeneoImage, 'ecommerce'),
                ])
            ),
            Row::fromProductModel(
                'root_product_model',
                'A family A',
                $rootProductModel->getCreated(),
                $rootProductModel->getUpdated(),
                '[root_product_model]',
                MediaValue::value('an_image', $akeneoImage),
                $rootProductModel->getId(),
                ['total' => 1, 'complete' => 0],
                null,
                new WriteValueCollection([])
            ),
        ];

        Assert::assertSame(2, $rows->totalCount());
        AssertRows::same($expectedRows, $rows->rows());
        Assert::assertSame(1, $rows->totalProductCount());
        Assert::assertSame(1, $rows->totalProductModelCount());
    }

    /**
     * {@inheritdoc}
     */
    protected function getConfiguration(): Configuration
    {
        return $this->catalog->useTechnicalCatalog();
    }
}
