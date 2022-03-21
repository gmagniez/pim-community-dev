<?php

declare(strict_types=1);

namespace Specification\Akeneo\Pim\Enrichment\Product\API\Command\UserIntent\Groups;

use Akeneo\Pim\Enrichment\Product\API\Command\UserIntent\Groups\GroupsUserIntent;
use Akeneo\Pim\Enrichment\Product\API\Command\UserIntent\Groups\RemoveGroups;
use PhpSpec\ObjectBehavior;

/**
 * @copyright 2022 Akeneo SAS (https://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class RemoveGroupsSpec extends ObjectBehavior
{
    function let()
    {
        $this->beConstructedWith(['promotions', 'toto']);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(RemoveGroups::class);
        $this->shouldImplement(GroupsUserIntent::class);
    }

    function it_returns_the_group_codes()
    {
        $this->groupCodes()->shouldReturn(['promotions', 'toto']);
    }
}
