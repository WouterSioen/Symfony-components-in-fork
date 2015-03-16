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

---

## Routing: Front controller

![Request flow (with routing)](img/request-flow.png)

---

## Routing: implementation

```yaml
# app/config/routing.yml
custom_application:
    path:/custom/application
    defaults:
        _controller: /Custom/Controller::helloWorldAction
```

---

## Routing: implementation

```php
// Custom/Class.php
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

---

## Service container

> Put simply, a Service is any PHP object that performs some sort of "global" task.

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

## Event dispatcher

Easy to hook into other modules without coupling.

* Now: remove the search module and half the backend breaks.
* Using events: remove the search module and the search indices will just not be saved

---

### Theory

Observer pattern

---

### Implementation

Optional: module/bundle overview of events

```php
namespace Backend\Modules\Blog;

final class BlogEvents
{
    /**
     * The form.submitted event is thrown each time a formbuilder instance is
     * submitted.
     *
     * The event listener receives an
     * Backend\Modules\Blog\Event\PostSavedEvent instance.
     *
     * @var string
     */
    const POST_SAVED = 'blog.post_saved';
}
```

---

### Implementation

Event containing the needed data (immutable object)

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

---

### Implementation

Event subscriber

```php
namespace Backend\Modules\Search\EventListener;

use Backend\Modules\Blog\Event\PostAddedEvent;
use Backend\Modules\Search\Engine\Model as SearchModel;

class SearchIndexListener
{
    protected $module;

    public function __construct($module)
    {
        $this->module = $module;
    }

    public function onPostSaved(PostAddedEvent $event)
    {
        $post = $event->getPost();

        SearchModel::saveIndex(
            $this->module,
            $post['id'],
            array(
                'title' => $post['title'],
                'text' => $post['text'],
            )
        );
    }
}
```

---

### Implementation

Hook the listener to the event

```yaml
services:
    blog.search_indexer:
        class: Backend\Modules\Search\EventListener\BlogPostSearchIndexListener
        arguments:
            - "Blog"
        tags:
            - { name: kernel.event_listener, event: blog.post_saved, method: onPostSaved }
```

---

### Implementation

Dispatching the event

```php
$this->get('event_dispatcher')->dispatch(
    BlogEvents::POST_SAVED,
    new PostSavedEvent($post)
);
```

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
                'language' => 'en',
                'meta_id' => $metaId,
                'title' => 'Event for functional tests',
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

use Common\WebTestCase;

class IndexText extends WebTestCase
{
    public function testIndexContainsEvents()
    {
        $client = static::createClient();

        $this->loadFixtures(
            $client,
            array(
                'Backend\Modules\Events\DataFixtures\LoadEvents',
            )
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

        $client->request('GET', '/en/events', array('page' => 34));
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
    $crawler->filter('html:contains("Event for functional tests")')->count()
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
