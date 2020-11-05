# wcag2aaa

Run the rules specified in the "wcag2aaa" tag of Axe.

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#wcag-20-level-a--aa-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `identical-links-same-purpose` rule of axe -->
<h4>Neighborhood News</h4>
<p>
  Seminole tax hike: Seminole city managers are proposing a 75% increase in
  property taxes for the coming fiscal year.
  <a href="taxhike.html" aria-label="Read more about Seminole tax hike">
    [Read more...]
  </a>
</p>

<p>
  Baby Mayor: Seminole voters elect the city's youngest mayor ever by voting in
  3 year old Willy "Dusty" Williams in yesterday's mayoral election.
  <a
    href="babymayor.html"
    aria-label="Read more about Seminole's new baby mayor"
  >
    [Read more...]
  </a>
</p>
```

## :warning: Incorrect

```html acot-template:templates/custom.html
<!-- Example: `identical-links-same-purpose` rule of axe -->
<h4>Neighborhood News</h4>
<p>
  Seminole tax hike: Seminole city managers are proposing a 75% increase in
  property taxes for the coming fiscal year.
  <a href="taxhike.html">[Read more...]</a>
</p>

<p>
  Baby Mayor: Seminole voters elect the city's youngest mayor ever by voting in
  3 year old Willy "Dusty" Williams in yesterday's mayoral election.
  <a href="babymayor.html">[Read more...]</a>
</p>
```
