# Effectively using the Symfony components in Fork.

## Introduction

I'm Wouter
some more blabla

---

## What topics will we talk about

* Routing
* Dependency injection container
* Console
* Event Dispatcher
* functional tests

---

## What topics won't we talk about

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

---

## Resources

http://symfony.com/doc/current/index.html
https://speakerdeck.com/ronnylt/dic-to-the-limit-desymfonyday-barcelona-2014