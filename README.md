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
