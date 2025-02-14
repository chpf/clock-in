# Clock In

Dead simple (as in more boilerplate that acutal code) [obsidian](https://obsidian.md) plugin that provides three addidional commands

- `clock-in`
- `clock-out`
- `recalculate-ours`


Clocking in and out adds the folowwing syntax to the YAML-Frontmatter of the active document. Recalculating recalculates.
```yaml
---
LOGBOOK:
  - CLOCK_IN: 2025-02-13T09:55:44.877Z
    CLOCK_OUT: 2025-02-13T12:33:46.307Z
    HOURS: 2.63
---
```

Query the Frontmatter with [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) to build a timesheet for the entire vault.

```dataview
TABLE WITHOUT ID
    entry.CLOCK_IN as Started,
    entry.HOURS as Hours
FLATTEN LOGBOOK as entry
WHERE entry.HOURS AND entry.CLOCK_IN
```

You can clock in and out more that once per file, adjust your dataview query if needed.