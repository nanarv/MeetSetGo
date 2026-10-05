# MeetSetGo — core loop spec

Builds the first slice of the app described in [init-MSG](./init-MSG). Decisions below
were settled in a design interview and override `init-MSG` where they differ.

## Decisions

| Topic | Decision |
| --- | --- |
| Database | Cloud Firestore (`nam5`), not Realtime Database |
| Auth | No Google sign-in. Firebase Anonymous Auth runs silently; people identify themselves with a name |
| Security | Relaxed for now: any signed-in browser can read; you edit only your own availability; only the creator edits/deletes a meeting |
| Scope | Create meeting → share link → join with name → paint availability → live group heatmap + respondent list |
| Later | Top X times, picking a final time, `.ics` export |
| Days | Days of the week only (Mon–Sun toggles, Mon–Fri pre-selected). No specific dates |
| Time zone | One fixed zone per meeting (creator's browser zone), shown as a label |
| Link | Random 6-char base62 id at `/m/:id`, with a Copy link button |
| Managing | Home page lists "Your meetings" (created or joined in this browser). Creator can edit details and delete. Days/time range are locked after creation |
| Responses | Only show who responded (anyone who joined with a name). No expected-invitee list |
| Routing | React Router |

## Data model

```
meetings/{shortId}
  title, description, location
  durationMinutes        // dropdown, 15–180 in 15-min steps
  days: ["Mon","Wed","Fri"]
  startTime: "09:00", endTime: "17:00"
  timeZone: "America/Chicago"
  creatorId
  participantIds: [uid]
  createdAt

meetings/{shortId}/participants/{uid}
  name
  availability: { "Mon-0900": "available", "Mon-0915": "notPreferred" }  // empty = Not Available
  updatedAt
```

## Grid interaction

- Pen selector: Available (green), Not Preferred (yellow), Erase.
- Click or drag paints a rectangle of 15-minute cells with the current pen.
- Starting a drag on a cell already painted with the current pen erases instead.
- Pointer events (mouse + touch). Arrow keys move, Space/Enter paints the focused cell.
- Changes are saved to Firestore when the drag ends.

## Group heatmap

- Shade = number of people who can make the slot (Available or Not Preferred).
- Gold outline when every respondent is Available.
- Hover or focus a cell to see who is Available, Not Preferred, and unavailable.
- Desktop: my grid left, group heatmap right. Mobile: tabs.
