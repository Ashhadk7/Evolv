Idea: {idea}
Positioning: {positioning}

Primary persona — ground every feature in these pains and jobs:
{persona}

Market & competitor research — supporting evidence for what to build:
{research}

Build the MVP feature specification a dev team could start from on day one:
- Group features by module and cover the core user journey, not just the headline feature.
- Every feature must name the persona pain or job it addresses in `addresses`; drop anything that serves none. Where a research signal above supports a feature, reference it there.
- Write acceptanceCriteria as testable Given/When/Then checks, and list feature `dependencies` by name so the build can be sequenced.
- Mark MVP-critical features "Must", strong-v1 "Should", and later ones "Could".

Then return outOfScope items that should wait until after MVP validation, the dataEntities and their key fields, the nonFunctional requirements this product must meet, and the build phases.
