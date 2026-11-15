# Spring MVC and WebFlux: Reading Guide

Source: [Pro Spring MVC with WebFlux (PDF)](<../../Scalar java backend contents/Marten Deinum,Iuliana Cosmina (auth.) - Pro Spring MVC with WebFlux_ Web Development in Spring Framework 5 and Spring Boot 2 (2021, Apress) [10.1007_978-1-4842-5666-4] - libgen.li.pdf>)

This is a study guide, not a conversion or summary of the book. Read the source you are authorized to use and make your own notes with the prompts below.

## Before reading

- Review Java, HTTP, dependency injection, and Spring Boot fundamentals.
- Keep a small sample application to test concepts rather than only memorizing annotations.
- For each chapter or topic, record the source page/chapter and any version-specific behavior.

## Study prompts

For each feature you encounter, write down:

1. What problem does it solve?
2. Which Spring component or API is responsible?
3. What enters and leaves the component?
4. How are errors, validation, and configuration handled?
5. What is the smallest runnable example?
6. What should be tested, and at which layer?

## Compare the two web models

As you read about Spring MVC and WebFlux, build your own comparison table:

| Question | Spring MVC | Spring WebFlux |
|---|---|---|
| Programming model | Fill in from the source | Fill in from the source |
| Request handling and concurrency | Fill in from the source | Fill in from the source |
| Return types / asynchronous work | Fill in from the source | Fill in from the source |
| When it fits your application | Fill in from the source | Fill in from the source |
| Operational trade-offs | Fill in from the source | Fill in from the source |

Do not assume reactive code is automatically faster; connect the model to the application's workload and dependencies.

## Practice plan

- Build a small HTTP endpoint and add request validation.
- Add a service and persistence boundary.
- Add error responses and tests.
- Implement one asynchronous or streaming use case, if appropriate.
- Record what changed when using the alternate web stack and which dependencies support it.

## Revision checklist

- Can you trace a request from the web layer to the application logic and back?
- Can you explain which web model suits a given workload and why?
- Can you identify blocking work in an asynchronous flow?
- Can you test success, validation failure, and downstream failure?
