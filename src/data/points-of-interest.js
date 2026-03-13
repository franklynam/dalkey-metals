/**
 * Points of interest along The Metals route.
 * waypointIndex references the corresponding entry in METALS_PATH (0-based).
 * Scene position is looked up at render time — no coordinates needed here.
 */
export const POINTS_OF_INTEREST = [
  {
    id: "dalkey-quarry",
    waypointIndex: 0,
    title: "Dalkey Quarry",
    body: "This is where the granite blocks were drawn by horse to the top of Incline 1 and then deposited in cars that were hooked to the Incline 1 chain.",
  },
  {
    id: "no2",
    waypointIndex: 1,
    title: "Incline no. 2",
    body: "After travelling down the first incline, the cars were unhooked from the Incline 1 chain and then drawn across the road by horse to the top of Incline 2, where there were hooked to the Incline 2 chain.",
  },
  {
    id: "no3",
    waypointIndex: 2,
    title: "Incline no. 3",
    body: "After travelling down the second incline, the cars were unhooked from the Incline 2 chain and then drawn by horse across the road and a level area to the top of Incline 3, where there were hooked to the Incline 3 chain.",
  },
  {
    id: "horse-to-kingstown",
    waypointIndex: 4,
    title: "Horse to Kingstown",
    body: "The cars were unhooked from the Incline 3 chain and then drawn by horse to Kingstown.",
  },
  {
    id: "kingstown",
    waypointIndex: 21,
    title: "Kingstown",
    body: "Finally, the granite was either used in the construction of the Kingstown Pier or shipped to other building sites such as at the piers in Dublin port.",
  },
];
