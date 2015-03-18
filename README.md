# Effectively using the Symfony components in Fork CMS.

---

## Hi, I'm Wouter

![Sumo Wouter](img/Sumo_Wouter.png)

:twitter: [@WouterSioen](http://twitter.com/WouterSioen)

:github: [WouterSioen](http://github.com/WouterSioen)

---

## I work at Sumocoders

---

![I mainly use Symfony](img/symfony.png)

---

# I'm a Fork core developer

---

## Topics

* Routing
* Dependency injection container
* Console
* Event Dispatcher
* Functional tests

---

## Topics we won't talk about

* Debug
* Filesystem
* Finder
* HttpFoundation
* HttpKernel
* Monolog
* Yaml

---

## Routing: Front controller

![Request flow (without routing)](img/request-flow-short.png)

???

Symfony follows the Front Controller pattern. This means that all requests use one
central entry point. This one place makes sure the request is routed to the right
controller and returns the response. In symfony, there are in fact two front controllers:
web/app.php for normal requests and web/app_dev.php for requests in debug mode.

In Fork CMS, we only have 1 front controller: our index.php file.

---

## Routing: Front controller

![Request flow (with routing)](img/request-flow.png)

???

The diagram in the previous slide was in fact an ultra simplified version of how
symfony sends the requests to the right controller. The handle() method is called
on the HttpKernel and the request is send to it as a parameter. This handle method
will dispatch the kernel.request event. (more about events later). There could be
multiple listeners to this event, but in most cases, it will be the "RouterListener"
that will send back the controller method.

---

## Routing: implementation

```yaml
# app/config/routing.yml
custom_application:
    path:/custom/application
    defaults:
        _controller: /Custom/Controller::helloWorldAction
```

???

All our routes are (for now) saved in the app/config/routing.yml file. You can
just add an extra entry in there with a name, a path and a controller. When the
given route is matched, the given controller will be responsible to send back the
response. The name is used to generate url's to this route.

Note that the order of the entries in this routing.yml file is important. The routing
component will check the routes until a matching route is found. Routes that are
further in the document, but also match the given url won't even be considered.

---

## Routing: implementation

```php
// Custom/Controller.php
namespace Custom;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller
{
    public function helloWorldAction(Request $request)
    {
        return new Response('Hello world');
    }
}
```

???

To make your controller work, you have to add the controller method specified in
your routing.yml file. Even though the static notation is used in the yaml file,
your method should not be static. An instance of the Controller class will be made
and the parameters will be injected. If a parameter typehinted as a Request is available
(like in the example), the request object will be inserted.

every controller should return a Response. This will be bubbled up to the Front
Controller and send to the user.

---

## Routing: parameters

```yaml
# app/config/routing.yml
custom_application:
    path:/custom/application/{page}
    defaults:
        _controller: /Custom/Controller::helloWorldAction
        page: 1
    requirements:
        page: d\+
```

???

You can add parameters to your routes to make it a lot more dynamic. The preview
shows a page number as argument, but this could be a slug, an id, ...

You can also add requirements and defaults to these parameters. Requirements will
make sure the route can only be matched when the parameters follow a certain regex.
In this case, only numbers will match, because we can only interpret these as page
numbers.

We've given the page as default number "1". This makes it easy to make parameters
not required.

---

## Routing: parameters

```php
// Custom/Controller.php
namespace Custom;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller
{
    public function helloWorldAction(Request $request, $id)
    {
        return new Response('Hello world: page' . $id);
    }
}
```

???

The parameter will be injected in your method. Note that the matching is done on
variable name. The order is not relevant. You can also change the request to not
be the first parameter.

---

## Service container

> Put simply, a Service is any PHP object that performs some sort of "global" task.
>
> -- Fabien Potencier

---

## DIC: Dependency injection

> Dependency injection is a _design pattern_ to achieve depencency inversion.

---

## DIC: Dependency inversion

SOLID principles

* Single responsibility
* Open-Closed
* Liskov Substitution
* Interface Segregation
* __Dependency inversion__

---

## DIC: Dependency inversion

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

<!-- -->

> Abstractions should not depend on details. Details should depend on abstractions.
>
> -- Robert C. Martin

---

## DIC: dependency inversion

```php
class Database
{
    protected $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function execute($query, $parameters)
    {
        // execute the query

        $this->logger->info(
            'query executed',
            array($query, $parameters)
        );
    }
}
```

---

## DIC: what's in there?

```bash
# List all services
app/console container:debug
```

```bash
# I know what I'm looking for
app/console container:debug | ack mailer
```

---

## DIC: adding a service

```yaml
# app/config/routing.yml
services:
    paginator:
        class: Common\Paginator
        arguments: [ "@logger" ]
```

```php
// src/Frontend/Blog/Actions/Index.php
$this->tpl->assign(
    'pagination',
    $this->get('paginator')->paginate($blogPosts)
);
```

---

## DIC: adding a service

Using a factory

```yaml
# app/config/routing.yml
services:
    faker:
        class: Faker\Generator
        factory_class: Faker\Factory
        factory_method: create
        arguments: [ 'en_US' ]
```

---

## Console

Used by

* Composer
* Behat
* phpspec
* ...

---

## Console: some commands

```bash
# list all commands
app/console

# start a php server that users the current folder as docroot
app/console server:run --docroot=.

# list all services in the DIC
app/console container:debug

# list all loaded routes
app/console router:debug
```

---

## Console: implementation

```php
// Common/Command/HelloWorldCommand.php
namespace Common\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class HelloWorldCommand extends Command
{
    protected function configure()
    {
        $this->setName('hello:world')
            ->setDescription('Say hello to the world');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('Hello meetup!');
    }
}
```

---

## Console: implementation

```php
// app/console
$application = new Application($kernel);
$application->add(new \Common\Command\HelloWorldCommand());
$application->run($input);
```

---

## Console: other stuff

* Options & arguments
* Helpers
  * Question
  * Formatter
  * Progress bar
  * Table
* Coloring output
* Verbosity

---

## Event dispatcher

Easy to hook into other modules without coupling.

* Now: remove search module => backend breaks.
* Using events: remove module => search indices not saved

---

## Event dispatcher: theory

![Observer pattern](img/Observer.png)

---

## Events: Implementation

```php
namespace Backend\Modules\Blog;

final class BlogEvents
{
    /**
     * The form.submitted event is thrown each time a
     * formbuilder instance is submitted.
     *
     * The event listener receives an
     * Backend\Modules\Blog\Event\PostSavedEvent instance.
     *
     * @var string
     */
    const POST_SAVED = 'blog.post_saved';
}
```

???

Optional: module/bundle overview of events

---

## Events: Implementation

```php
namespace Backend\Modules\Blog\Event;

use Symfony\Component\EventDispatcher\Event;

class PostSavedEvent extends Event
{
    protected $post;

    public function __construct($post)
    {
        $this->post = $post;
    }

    public function getPost()
    {
        return $this->post;
    }
}
```

???

(Immutable) event containing the needed data

---

## Events: Implementation

```php
namespace Backend\Modules\Search\EventListener;

use Backend\Modules\Blog\Event\PostAddedEvent;
use Backend\Modules\Search\Engine\Model as SearchModel;

class SearchIndexListener {
    protected $module;

    public function __construct($module) {
        $this->module = $module;
    }

    public function onPostSaved(PostAddedEvent $event) {
        $post = $event->getPost();
        SearchModel::saveIndex(
            $this->module,
            $post['id'],
            [ 'title' => $post['title'], 'text' => $post['text'] ]
        );
    }
}
```

???

Event subscriber

---

## Events: Implementation

```yaml
services:
    blog.search_indexer:
        class: ...\EventListener\BlogPostSearchIndexListener
        arguments:
            - "Blog"
        tags:
            -
                name: kernel.event_listener
                event: blog.post_saved
                method: onPostSaved
```

???

Hook the listener to the event

---

## Events: Implementation

```php
$this->get('event_dispatcher')->dispatch(
    BlogEvents::POST_SAVED,
    new PostSavedEvent($post)
);
```

???

Dispatching the event

---

## Functional tests

* refactorings: make sure nothing breaks
* confidence in code
* $maintainability++

---

### Implementation

```php
namespace Backend\Modules\Events\DataFixtures;

class LoadEvents
{
    public function load(\SpoonDatabase $database)
    {
        $metaId = $database->insert(
            'meta',
            array('url' => 'event-for-functional-tests')
        );

        $database->insert(
            'events',
            array(
                'language'   => 'en',
                'meta_id'    => $metaId,
                'title'      => 'Event for functional tests',
                'start_date' => '2015-03-26',
                'start_hour' => '19:00,
            )
        );
    }
}
```

---

### Implementation

```php
namespace Frontend\Modules\Events\Tests\Actions;

class IndexText extends \Common\WebTestCase
{
    public function testIndexContainsEvents()
    {
        $client = static::createClient();
        $this->loadFixtures(
            $client,
            ['Backend\Modules\Events\DataFixtures\LoadEvents']
        );

        $client->request('GET', '/en/events');
        $this->assertEquals(
            200,
            $client->getResponse()->getStatusCode()
        );
        $this->assertContains(
            'Event for functional tests',
            $client->getResponse()->getContent()
        );
    }
}
```

---

### Implementation

```php
namespace Frontend\Modules\Events\Tests\Actions;

use Common\WebTestCase;

class IndexText extends WebTestCase
{
    public function testNonExistingPageGives404()
    {
        $client = static::createClient();

        $client->request(
            'GET',
            '/en/events',
            array('page' => 34)
        );

        $this->assertIs404($client);
    }
}
```

---

Useful assertions

```php
// assert url after redirect (clicking a link/submitting a form)
$this->assertStringEndsWith(
    '/en/events/detail/event-for-functional-tests',
    $client->getHistory()->current()->getUri()
);
```

```php
// test that the page title contains some words
$this->assertStringStartsWith(
    'Event for functional tests',
    $crawler->filter('title')->text()
);
```

```php
// assert that the page does not contain (have 0 occurences) of
$this->assertEquals(
    0,
    $crawler
        ->filter('html:contains("Event for functional tests")')
        ->count()
);
```

---

## Questions?

---

## Thanks!

<https://joind.in/talk/view/14182>

---

## Resources

http://symfony.com/doc/current/index.html
https://speakerdeck.com/ronnylt/dic-to-the-limit-desymfonyday-barcelona-2014
