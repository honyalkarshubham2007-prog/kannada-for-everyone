// Coach mode role-plays. `ai` is what Gemini is told to play; the rest is shown to the learner.
export type Scenario = { id: string; title: string; blurb: string; character: string; ai: string };

export const scenarios: Scenario[] = [
  { id: "auto", title: "Take an auto", character: "The driver",
    blurb: "You're the passenger. Agree on the meter and get off at the right place.",
    ai: "an auto driver in Bengaluru; the learner is a passenger who wants a ride, must agree on the meter and the stop" },
  { id: "restaurant", title: "Order at a hotel", character: "The waiter",
    blurb: "You're the customer at a local eatery (a 'hotel'). Order and ask for the bill.",
    ai: "a waiter at a small udupi-style eatery (called a 'hotel') in Mysuru; the learner is a customer ordering breakfast and asking for the bill" },
  { id: "market", title: "Buy vegetables", character: "The vendor",
    blurb: "You're the customer at a market. Ask prices and bargain politely.",
    ai: "a vegetable vendor at a market in Bengaluru; the learner is a customer asking prices, bargaining politely and buying" },
  { id: "bus", title: "Catch a bus", character: "The conductor",
    blurb: "You're the passenger. Check the route, buy a ticket, ask for your stop.",
    ai: "a BMTC bus conductor in Bengaluru; the learner is a passenger asking if the bus goes to Majestic, buying a ticket and asking to be told when the stop comes" },
];

export const findScenario = (id: unknown) => scenarios.find((s) => s.id === id);
