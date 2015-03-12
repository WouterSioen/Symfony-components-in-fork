# Effectively using the Symfony components in Fork.

## Introduction

I'm Wouter
some more blabla

---

## Topics we will talk about

* Routing
* Dependency injection container
* Console
* Event Dispatcher
* functional tests

---

## Topics we (probably) won't talk about

* Debug
* Filesystem
* Finder
* HttpFoundation
* HttpKernel
* Monolog
* Yaml

---

## Routing

Want to add a custom application?

/app/config/routing.yml

    custom_application:
        path:/custom/application
        defaults:
            _controller: /Custom/Application/Controller::helloWorldAction

Custom/Application/Class.php

    namespace Custom\Application;

    use Symfony\Component\HttpFoundation\Request;
    use Symfony\Component\HttpFoundation\Response;

    class Controller
    {
        public function helloWorldAction(Request $request)
        {
            return new Response('Hello world');
        }
    }

---

## Dependency injection container

> Put simply, a Service is any PHP object that performs some sort of "global" task.

Why? Some theory:

* Coupling
* Testability
* Dependency inversion

---

    app/console container:debug

---

/app/config/routing.yml

    services:
        paginator:
            class: Common\Paginator
            arguments: [ "@logger" ]

/src/Frontend/Blog/Actions/Index.php

    $this->tpl->assign(
        'pagination',
        $this->get('paginator')->paginate($blogPosts)
    );

---

Factory: used a lot for doctrine repositories

/app/config/routing.yml

    services:
        faker:
            class: Faker\Generator
            factory_class: Faker\Factory
            factory_method: create
            arguments: [ en_US ]

---

## Console

Used by

* Composer
* Behat
* phpspec
* ...

---

some useful included commands

    # list all commands
    app/console

    # start a php server that users the current folder as docroot
    app/console server:run --docroot=.

    # list all services in the DIC
    app/console container:debug

    # list all loaded routes
    app/console router:debug

---

Common/Command/HelloWorldCommand.php

    namespace Common\Command;

    use Symfony\Component\Console\Command\Command;
    use Symfony\Component\Console\Input\InputInterface;
    use Symfony\Component\Console\Output\OutputInterface;

    class HelloWorldCommand extends Command
    {
        protected function configure()
        {
            $this
                ->setName('hello:world')
                ->setDescription('Say hello to the world')
            ;
        }

        protected function execute(InputInterface $input, OutputInterface $output)
        {
            $output->writeln('Hello meetup!');
        }
    }

app/console

    $application = new Application($kernel);
    $application->add(new \Common\Command\HelloWorldCommand());
    $application->run($input);

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
<?php

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
<?php

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
<?php

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

## Resources

http://symfony.com/doc/current/index.html
https://speakerdeck.com/ronnylt/dic-to-the-limit-desymfonyday-barcelona-2014