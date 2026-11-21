/** Non-AI, offline example product generator. Every template is editable, never auto-sent. */
export type StarterProductIdea = {
  name: string
  category: string
  audience: string
  problem: string
  firstProduct: string
  price: string
  tagline: string
}

function templatesFor(category: string): Array<[string, string]> {
  switch(category) {
    case 'Auto services':
      return [
        ['New inquiry', 'Hi [first name], thanks for contacting [business]. What vehicle do you have and what service are you looking for? I can then suggest the right package.'],
        ['Estimate response', 'Hi [first name], based on the details you shared, the estimated starting price is [approved quote]. The final price depends on [condition/scope]. Would you like available appointment options?'],
        ['Follow up on a quote', 'Hi [first name], following up on the [service] estimate from [date]. If you have questions about timing or what is included, I am happy to clarify.'],
        ['Booking confirmation', 'Your [service] appointment is scheduled for [date/time] at [location]. Please reply to confirm these details and review [business policy].'],
        ['After-service check-in', 'Hi [first name], thank you for choosing [business] for your [service]. Is everything looking good? If anything needs attention, please let us know.']
      ]
    case 'Pet services':
      return [
        ['New customer response', 'Hi [first name], thanks for reaching out. Please share [pet name], age, and the dates or visits you need so we can check suitability and availability.'],
        ['Care instructions request', 'Could you send [pet name] feeding instructions, access details, emergency contact and any relevant vet information? Keep sensitive records in the approved secure system.'],
        ['Visit completed', 'Hi [first name], [pet name] completed the scheduled visit at [time]. Here is a short factual recap of [activities] and any observations: [notes].'],
        ['Schedule confirmation', 'We have penciled in [service] for [dates]. Please check the location, duration, and the cancellation policy before confirming.'],
        ['Post-visit follow up', 'Thank you for trusting [business] with [pet name]. If anything about the visit needs clarification, please reply here.']
      ]
    case 'Freelance services':
      return [
        ['Discovery response', 'Hi [name], thank you for outlining [project]. Could you confirm desired outcomes, deadline, budget range and existing assets?'],
        ['Proposal introduction', 'This proposal covers [deliverables] for [client]. It includes [revision rounds], a timeline of [milestones] and a quoted fee of [approved amount].'],
        ['Scope clarification', 'Before I confirm the estimate, can we agree whether [specific requested work] is inside or outside the deliverables?'],
        ['Project update', 'This week I completed [work]. Next I plan [next work], subject to your feedback on [decision].'],
        ['Invoice reminder', 'Hi [name], a friendly reminder that invoice [number] is due on [date]. If you have already paid, please disregard this note.']
      ]
    case 'Creative services':
      return [
        ['Photography inquiry', 'Hi [name], thanks for considering [business]. Which session type, desired date and location do you have in mind?'],
        ['Session preparation', 'Here is your session checklist: [location], [arrival time], [wardrobe guidance], and [agreed deliverables].'],
        ['Quote follow-up', 'I am following up on the [session] estimate. Let me know if you would like any clarification before booking.'],
        ['Delivery notice', 'Your [session] gallery is ready through the approved delivery link: [verified gallery URL]. Please keep that link private.'],
        ['Feedback request', 'Thank you for booking with us. If you have feedback about your experience, we would value hearing it.']
      ]
    default:
      return [
        ['New inquiry', 'Hi [first name], thanks for contacting [business]. Could you share the service you need and preferred timing?'],
        ['Estimate follow-up', 'Hi [first name], checking whether you had questions about our [service] estimate. We can clarify the scope before you decide.'],
        ['Confirmation', 'This confirms our agreed [service] on [date/time], subject to [published terms]. Please review and reply if anything is incorrect.'],
        ['Post-service follow up', 'Thank you for working with [business]. If there is anything we should address after [service], please tell us.'],
        ['Feedback request', 'We hope the service met your expectations. We welcome your honest feedback so we can keep improving.']
      ]
  }
}

export function generateStarterProduct(idea: StarterProductIdea): string {
  const title = idea.name + ' · Editable first product'
  const lines = [
    '# ' + title, '',
    '**Status:** Draft template kit for review. Not a finished paid product.',
    '**Proposed customers:** ' + idea.audience,
    '**Intended offer:** ' + idea.firstProduct,
    '**Price to test, not a verified sale:** ' + idea.price, '',
    '## How to use', '',
    '1. Replace every [square-bracket] placeholder with verified business information.',
    '2. Remove any statement you cannot substantiate.',
    '3. Check your jurisdiction, customer consent, and platform messaging requirements.',
    '4. Have the owner approve the final text; the Base88 preview never sends a message.', '',
    '## Five editable customer messages', ''
  ]
  templatesFor(idea.category).forEach(([subject, body], i) => {
    lines.push('### ' + (i+1) + '. ' + subject, '', body, '')
  })
  lines.push(
    '## Simple inquiry tracker', '',
    '| Date | Customer | Request | Stage | Approved quote | Next follow-up |',
    '| --- | --- | --- | --- | --- | --- |',
    '| [date] | [name] | [request] | New | [approved amount] | [date] |', '',
    '## Validation questions', '',
    '- Do you already do this work manually?',
    '- Which one of these templates would you use this week?',
    '- What existing solution do you use, and what is missing?',
    '- Would you pay the exact tested price today? If not, why?',
    '- What would make this product clearly more valuable?', '',
    '## Product acceptance checks', '',
    '- [ ] At least five members of the audience tested a template.',
    '- [ ] Pricing and copy are reviewed for accurate claims.',
    '- [ ] All customer examples are fictional or consented.',
    '- [ ] The final offer contains only deliverables that actually exist.',
    '- [ ] Checkout remains disabled until owner onboarding and webhook verification.',
    '', 'Created with the independent Base88 Surprise Me preview.'
  )
  return lines.join('\n')
}
