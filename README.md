# Effectively using the Symfony components in Fork.

## Introduction

I'm Wouter
some more blabla

---

## What topics will we talk about

* Routing
* Dependency injection container
* commands
* event disptacher
* monolog
* functional tests

---

## What topics won't we talk about

* Debug
* Filesystem
* Finder
* HttpFoundation
* HttpKernel
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

    <?php

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

## Dependency injection container

> Put simply, a Service is any PHP object that performs some sort of "global" task.

Why? Some theory:

* Coupling
* Testability
* Dependency inversion

    app/console container:debug

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


## Resources

http://symfony.com/doc/current/index.html
https://speakerdeck.com/ronnylt/dic-to-the-limit-desymfonyday-barcelona-2014