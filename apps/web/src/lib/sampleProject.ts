import type { Project } from '@placegraph/types';

export const SAMPLE_PROJECT: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
  name: 'Clerkenwell warehouse restaurant',
  location: {
    address: 'St John Street, Clerkenwell',
    city: 'London',
    neighborhood: 'Clerkenwell'
  },
  mode: 'evaluate',
  projectType: 'restaurant',
  organisationProfiles: [
    {
      id: 'profile-hospitality',
      type: 'hospitality',
      name: 'Hospitality group',
      primary: true,
      mandate: 'Create a destination restaurant in Clerkenwell',
      deliverables: ['concept_identity', 'fb_daypart_implications', 'programming_model']
    }
  ],
  primaryProfileId: 'profile-hospitality',
  decisionFrame: {
    type: 'establish',
    subject: 'Destination restaurant in Clerkenwell',
    capitalIntent: '£800k–1.2M',
    successTests: [],
    constraints: []
  },
  businessType: 'destination restaurant',
  objective:
    'Create a destination restaurant that can attract a design-aware dining audience from across London while remaining appropriate to Clerkenwell’s existing food culture — not a generic upscale fit-out, and not an entertainment venue.',
  budgetRange: '£800k–1.2M',
  floorArea: '2800 sq ft',
  audiences: [
    {
      name: 'Design-aware diners from across London',
      priority: 1,
      description: 'People who currently travel to specific rooms for food and atmosphere'
    },
    {
      name: 'Clerkenwell residents and local workers',
      priority: 2,
      description: 'Weekday lunch and neighbourhood evening trade'
    },
    {
      name: 'Hotel and culture visitors',
      priority: 3,
      description: 'People already in the area for galleries, publishing and hospitality'
    }
  ],
  constraints: [
    { key: 'Existing structure', value: 'Victorian warehouse shell, high ceilings', type: 'text' },
    { key: 'Kitchen', value: 'Full production kitchen required', type: 'text' },
    { key: 'Programming', value: 'Occasional cultural events cannot displace ordinary dining', type: 'text' }
  ]
};
