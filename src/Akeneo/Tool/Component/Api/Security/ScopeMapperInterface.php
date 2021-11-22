<?php
declare(strict_types=1);

namespace Akeneo\Tool\Component\Api\Security;

/**
 * @author    Willy Mesnage <willy.mesnage@akeneo.com>
 * @copyright 2021 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
interface ScopeMapperInterface
{
    /**
     * @return string[]
     */
    public function getAllScopes(): array;

    /**
     * @return string[]
     */
    public function getAcls(string $scopeName): array;

    /**
     * @return array{
     *      icon: string,
     *      type: string,
     *      entities: string,
     * }
     */
    public function getMessage(string $scope): array;

    /**
     * @return string[]
     */
    public function getLowerHierarchyScopes(string $scope): array;
}
