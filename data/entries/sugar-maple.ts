import type { Entry } from '@/types/specimen'

export const sugarMaple: Entry = {
  id: 'sugar-maple',
  standfirst:
    'For six weeks each spring, a hardwood tree becomes a pump with no moving parts — running on nothing but the difference between a frozen night and a thawing afternoon.',
  body: [
    {
      kind: 'p',
      lead: true,
      text:
        'There is a narrow window — late winter into early spring, when the nights still freeze but the days have begun to relent — in which the sugar maple does something almost no other tree can. It builds pressure inside its own trunk. Not the slow osmotic push of roots that most plants rely on, but a genuine positive pressure, strong enough to drive sap upward and outward against gravity, out of any wound in the wood. Tap it, and it bleeds sweet. The tree is, for those weeks, a *[heat engine](freeze-thaw)* that runs on the boundary between the living and the geophysical.',
    },
    {
      kind: 'p',
      text:
        'This is the specimen the whole collection grew outward from. Pull the maple and five other threads come with it: the physics that pressurizes it, the molecule that only exists because we boil it, the storm that periodically shatters it, the underground economy that feeds it, and the slow forest arithmetic that decides whether its seedlings ever reach the light.',
    },

    { kind: 'section', title: 'The pump' },
    {
      kind: 'p',
      text:
        'Most trees move water by pulling. Transpiration at the leaves puts the whole water column under tension, and the tree drinks from the top down. The maple in early spring does the opposite — it *pushes*, and it has no leaves yet to pull with. The mechanism is a quiet marvel of [freeze-thaw hydraulics](freeze-thaw): the wood of *Acer saccharum* contains gas-filled fibre cells packed among its sap-conducting vessels. When temperature drops below freezing, ice forms on the vessel walls and the gas in the fibres contracts and dissolves, drawing sap inward under suction. When the thaw comes, the process reverses — gas comes out of solution, expands, and squeezes the thawing sap under pressure that has been measured as high as 200 kilopascals, roughly twice atmospheric.',
    },
    {
      kind: 'aside',
      text:
        'The elegant part: the fuel is not sugar or sunlight but *temperature change itself*. A maple in a climate with warm nights makes no pressure. The tree needs the cold as much as the warmth — it is the swing between them that does the work.',
    },
    {
      kind: 'pullquote',
      text: 'The maple is a heat engine that runs on the difference between night and day.',
      att: 'Lab notes, Jan 2025',
    },
    {
      kind: 'p',
      text:
        'Sugar is not the engine, but it is the reason the engine matters to anything with a tongue. Through the previous summer the tree stored starch in its rays and parenchyma; over winter enzymes converted a portion to sucrose, so the sap that rises in spring carries roughly two to three percent sugar. It is a faint sweetness — you could drink it and barely notice. What we call syrup is that sap concentrated some forty times over open heat, and in the concentrating, something new appears.',
    },

    { kind: 'section', title: 'A molecule that was waiting for us' },
    {
      kind: 'p',
      text:
        'Raw maple sap does not contain [quebecol](quebecol). The molecule is not in the tree. It forms only in the pan, during the long reduction of sap to syrup, when temperatures climb toward 93°C and the phenolic compounds already present begin to react and recombine. It is, in the strict sense, an *artefact of human processing* — a compound that came into the world because people decided to boil a forest’s sap down to sweetness. The maple made the ingredients. We made the reaction.',
    },
    {
      kind: 'figure',
      mono:
`  sap  ────────────►  syrup
  ~2% sugar          ~66% sugar
  no quebecol        quebecol present
       │                  ▲
       └──── boil, 93°C ──┘
        (~40 : 1 reduction)`,
      caption: 'The threshold at which a food becomes, briefly, a chemistry experiment.',
    },
    {
      kind: 'p',
      text:
        'This is the kind of fact the Arium exists to hold. It refuses the tidy boundary between *natural* and *made*. The sweetness is the tree’s; the molecule is ours; neither would exist without the other.',
    },

    { kind: 'section', title: 'What breaks it, what feeds it' },
    {
      kind: 'p',
      text:
        'A sugar maple is not a solitary object. Below ground it is wired into a [mycorrhizal network](mycorrhizal) — a fungal trading floor where the tree exchanges photosynthetic carbon for phosphorus and nitrogen it cannot easily reach alone. A mature maple is less an individual than a node with obligations.',
    },
    {
      kind: 'p',
      text:
        'Above ground, its great vulnerability is ice. A severe [ice storm](ice-storm) can load branches with a glaze heavy enough to snap crowns that took two centuries to build — the January 1998 storm across the maple belt did exactly this, and the canopy gaps it tore open are still legible in the forest today. But destruction here is also a reset. Every gap is an invitation, and which species answers it is governed by [ecological succession](succession): the maple is a patient, shade-tolerant climax species, content to wait in the understory for decades until an old giant falls and the light comes down.',
    },
    {
      kind: 'pullquote',
      text: 'It tastes of the boundary between the living and the geophysical.',
      att: 'Field journal, March 1998',
    },
    {
      kind: 'p',
      text:
        'That is the whole argument of this collection in a single organism. The maple is not one thing you can finish reading. It is a pressure system, a chemistry, a network, and a slow negotiation with catastrophe — and each of those is its own thread, waiting to be pulled.',
    },
  ],
  colophon:
    'Field notes and lab observations, 1998–2025. Cross-references live; some linked threads are still in preparation.',
}
