export const VISUALIZATION_VIEWS = [
    {
        key: 'cutaway',
        label: 'Complete building cutaway',
        composition: 'One photorealistic architectural cutaway of the complete building, a high three-quarter dollhouse view. ' +
            'The entire building sits uncropped in one frame. Remove the roof and front wall so every interior zone is visible at once, while the facade, entrance, landscaping and site context remain visible. ' +
            'Coherent structure, realistic materials, all zones legible together, not a diagram.'
    },
    {
        key: 'exterior',
        label: 'Exterior — complete building',
        composition: 'One photorealistic architectural photograph of the complete building from across the street. ' +
            'The whole building fits inside the frame with generous context: full massing, roof, entrance, facade materials, landscaping, street edge and neighbouring buildings. ' +
            'Wide establishing shot, no crop.'
    },
    {
        key: 'interior',
        label: 'Interior — main hall',
        composition: 'One photorealistic wide-angle interior architectural photograph of the main hall. ' +
            'Show all primary zones together in one coherent space, with clear circulation between them. 24mm lens at eye level, realistic daylight and artificial lighting, no people, no crop.'
    }
];
export const VISUALIZATION_NEGATIVE_PROMPT = 'cropped building, collage, split screen, multiple buildings, facade-only, floor plan, diagram, labels, text, lettering, signage, logos, watermark, blurry, stock photo, oversaturated, cartoon, people, crowds';
