# Product Thinking

Source: [Product_Thinking.pdf](<../../Scalar java backend contents/Product_Thinking.pdf>) (16 pages)

## Core idea

Product thinking is the practice of accurately predicting what users and the market will value. Understand the problem before selecting a solution:

> If you do not truly understand the problem, you have not earned the right to solve it.

The source contrasts user needs with what a business may be inclined to build. Strong product work connects a real user problem to a business goal and tests whether the solution improves an outcome.

## Problem space and solution space

Do not jump straight from a request to an implementation. Work through:

```text
Business goal + market context
        -> user personas and goals
        -> observed user problems
        -> prioritize a problem
        -> explore several solutions
        -> compare impact, effort, and trade-offs
        -> deliver and measure
```

The source diagram places user persona, user problems/goals, and problem prioritization in the problem space. UX/UI, technology, solution prioritization, and roadmap/execution sit in the solution space ([page 6](<../../Scalar java backend contents/Product_Thinking.pdf#page=6>)).

## The seven steps

1. **Find the goal.** Examples: growth, retention, revenue, or engagement. Be specific about which outcome matters.
2. **Identify users.** Describe useful personas and the context in which they use the product.
3. **Find their problems.** Use interviews, analytics, observation, and other evidence—not only internal assumptions.
4. **Prioritize problems.** Ask how critical the problem is and what alternatives users have.
5. **Explore solutions.** Generate multiple plausible ways to address the chosen problem.
6. **Prioritize solutions.** Compare expected impact with effort and trade-offs.
7. **Choose success metrics.** Decide what evidence would show the solution is working.

The steps form a learning loop: new evidence can change the problem definition or the next solution.

## Worked example: Slack integrations

The source identifies business users such as executives, operations, technology, HR, and marketing teams. One problem is switching between many separate tools and logins (the notes list services such as Gmail, CRM, GitHub, Jira, and Hangouts). The problem is considered critical because the alternatives are unsatisfactory.

Possible solutions in the source:

- Bookmark popular services and allow one-click access.
- Build custom solutions for large teams.
- Expose APIs.
- Create an integration marketplace.

The source's comparison is:

| Solution | Impact | Effort | Priority in notes |
|---|---:|---:|---:|
| Bookmark popular services / one-click access | Medium | Low | P1 |
| Custom solutions for large teams | High | High | P2 |
| Expose APIs | High | Medium | P0 |
| Create an integration marketplace | High | Medium | P0 |

These priority labels are the example's judgment, not universal scoring rules. A team should explain why a solution's impact and effort receive their estimates and what assumptions remain untested.

The notes suggest measuring integration usage, daily active users, and retention among users who adopt integrations. These measure different things: feature adoption, ongoing product activity, and longer-term value. Choose a baseline and comparison method so that a change in the metric can be interpreted.

## Practice: improve LinkedIn

Use the same sequence:

1. Choose a goal and target user persona.
2. Discover problems through interviews, analytics, and observation.
3. Prioritize a problem based on criticality and available alternatives.
4. Generate several solution options.
5. Compare impact, effort, and trade-offs.
6. Define metrics before rollout.

The source suggests session activity as one possible area to examine, but does not specify a complete LinkedIn solution. Treat the prompt as an exercise rather than an answer key.

## How to develop product thinking

Observe products around you and ask:

1. What problem is the product solving?
2. Who are the relevant users?
3. How do alternatives solve the problem?
4. How is this product different?
5. Could a better solution solve the problem?

## Quick self-check

1. Why should problem discovery precede solution design?
2. What evidence could validate a user problem?
3. What is the difference between prioritizing problems and prioritizing solutions?
4. How do impact and effort influence the Slack example's priorities?
5. Which metrics would distinguish feature adoption from long-term value?
6. Why should a team define success measures before shipping?

## Source page guide

- [Pages 2–8](<../../Scalar java backend contents/Product_Thinking.pdf#page=2>): problem vs. solution space and the seven-step process.
- [Pages 10–14](<../../Scalar java backend contents/Product_Thinking.pdf#page=10>): Slack users, problem, solution options, and impact/effort table.
- [Pages 15–16](<../../Scalar java backend contents/Product_Thinking.pdf#page=15>): LinkedIn improvement exercise and habits for developing product thinking.
