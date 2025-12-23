// Infinity Apps Collection
// All apps integrate with the Infinity Token system and Rogers Core

const infinityApps = [
    {
        id: 'locals-chat',
        name: 'Locals Chat',
        icon: '📍',
        category: 'social',
        description: 'Connect with people in your area using zip code-based chat rooms',
        features: ['Zip code search', 'Local groups', 'Safe connections', 'Token rewards for engagement']
    },
    {
        id: 'video-game-generator',
        name: 'Video Game Generator',
        icon: '🎮',
        category: 'creation',
        description: 'AI-powered video game creation with autopilot assistance',
        features: ['Game design AI', 'Asset generation', 'Code generation', 'Instant prototyping']
    },
    {
        id: 'school-app',
        name: 'Infinity School',
        icon: '🎓',
        category: 'education',
        description: 'Lifelong learning from newborn to elderly',
        features: ['Age-appropriate content', 'Progress tracking', 'AI tutoring', 'Token rewards for learning']
    },
    {
        id: 'physical-therapy',
        name: 'Physical Therapy & Exercise',
        icon: '💪',
        category: 'health',
        description: 'Guided exercises and physical therapy routines',
        features: ['Custom routines', 'Video guides', 'Progress tracking', 'AI form correction']
    },
    {
        id: 'alarm-clock',
        name: 'Alarm Clock',
        icon: '⏰',
        category: 'utility',
        description: 'Smart alarm with voice integration',
        features: ['Voice commands', 'Smart wake-up', 'Routine triggers', 'Token reminders']
    },
    {
        id: 'calculator',
        name: 'Calculator',
        icon: '🔢',
        category: 'utility',
        description: 'Standard calculator with token conversion',
        features: ['Basic operations', 'Token calculator', 'History', 'Voice input']
    },
    {
        id: 'scientific-calculator',
        name: 'Scientific Calculator',
        icon: '🧮',
        category: 'utility',
        description: 'Advanced scientific calculations',
        features: ['Scientific functions', 'Graphing', 'Unit conversion', 'Formula library']
    },
    {
        id: 'clothing-design',
        name: 'Clothing Design Studio',
        icon: '👔',
        category: 'creation',
        description: 'Design custom clothing with AI assistance',
        features: ['Design tools', 'AI suggestions', 'Virtual fitting', 'Token marketplace']
    },
    {
        id: 'food-textiles-trade',
        name: 'Food & Textiles Trading',
        icon: '🌾',
        category: 'marketplace',
        description: 'Global trading platform for food, textiles, and materials',
        features: ['Token-based trading', 'Quality verification', 'Global network', 'Fair trade practices']
    },
    {
        id: 'leather-craft',
        name: 'Leather Craft',
        icon: '🧤',
        category: 'creation',
        description: 'Leather crafting tutorials and marketplace',
        features: ['DIY tutorials', 'Pattern library', 'Tool guides', 'Marketplace']
    },
    {
        id: 'diy-modeling',
        name: 'DIY Modeling Hub',
        icon: '🔨',
        category: 'creation',
        description: 'Instructables-style DIY projects and guides',
        features: ['Step-by-step guides', 'Community sharing', 'Video tutorials', 'Token rewards']
    },
    {
        id: 'infinity-marketplace',
        name: 'Infinity Token Marketplace',
        icon: '🏪',
        category: 'marketplace',
        description: 'eBay-like marketplace using only Infinity Tokens - No USD',
        features: ['Token-only economy', 'No fiat currency', 'Fair pricing', 'Seller ratings']
    },
    {
        id: 'bible-verse',
        name: 'Bible Verse Infinity',
        icon: '📖',
        category: 'spiritual',
        description: 'Rogers-analyzed Bible verses with time-date correlation and divine messaging',
        features: ['Daily verses', 'Rogers analysis', 'Isaiah 1:7 reference', 'God\'s love messages', 'Time-date compilation']
    },
    {
        id: 'pet-care',
        name: 'Pet Care Manager',
        icon: '🐾',
        category: 'lifestyle',
        description: 'Complete pet management with feeding schedules and care tracking',
        features: ['Feed schedules', 'Vet appointments', 'Health tracking', 'Token rewards']
    },
    {
        id: 'gardening-seeds',
        name: 'Seed Swapping Network',
        icon: '🌱',
        category: 'lifestyle',
        description: 'Global gardening community for seed exchange',
        features: ['Seed catalog', 'Swap system', 'Growing guides', 'Community tips']
    },
    {
        id: 'channel-generator',
        name: 'Channel Generator',
        icon: '📺',
        category: 'entertainment',
        description: 'Merit-based TV channel assignment with audition submissions',
        features: ['AI analysis placement', 'Digital channels', 'Audition portal', 'Educational programming', 'Real-world integration', 'Submission forms']
    },
    {
        id: 'packaging-glass',
        name: 'Infinity Glass Packaging',
        icon: '🏺',
        category: 'utility',
        description: 'Standardized glass packaging system',
        features: ['Standard sizes', 'Eco-friendly', 'Quality control', 'Token tracking']
    },
    {
        id: 'truth-database',
        name: 'Truth & Transparency Database',
        icon: '⚠️',
        category: 'information',
        description: 'Banned products, corrupt companies, and truth reporting - Including Tesla driverless vehicle brain chip revelations',
        features: ['Product safety alerts', 'Company transparency', 'Aluminum oxide chip story', 'Design archives (2-1 years ago)', 'Front page news', 'Community reporting']
    }
];

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = infinityApps;
}
