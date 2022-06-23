<?php

declare(strict_types=1);

namespace Akeneo\Connectivity\Connection\Tests\EndToEnd;

use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;

/**
 * @author JMLeroux <jean-marie.leroux@akeneo.com>
 * @copyright 2022 Akeneo SAS (http://www.akeneo.com)
 * @license http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 *
 * A sub class of the Guzzle handler stack providing a JSON filesystem history.
 * The purpose of this handler is to share its history between a parent process and subprocess. It is useful to  keep track of the history of the webhook call in the tests. Indeed, the webhook call is performed in a subprocess.
 */
class GuzzleMockHandlerStack extends HandlerStack
{
    private ?GuzzleJsonHistory $container;

    public function historyContainer(): GuzzleJsonHistory
    {
        return $this->container;
    }

    public static function createWithHistoryContainer(GuzzleJsonHistory $historyContainer)
    {
        $stack = new self(new MockHandler([new Response(200)]));
        $stack->push(Middleware::httpErrors(), 'http_errors');
        $stack->push(Middleware::redirect(), 'allow_redirects');
        $stack->push(Middleware::cookies(), 'cookies');
        $stack->push(Middleware::prepareBody(), 'prepare_body');

        $historyContainer->resetHistory();
        $history = Middleware::history($historyContainer);
        $stack->push($history);

        $stack->container = $historyContainer;

        return $stack;
    }
}
