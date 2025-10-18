# 🤖 AI Agent Instructions - READ THIS FIRST

**⚠️ MANDATORY: All AI agents must read this file BEFORE starting any task.**

This document contains critical rules and context that prevent common mistakes and ensure consistency with project standards.

---

## 📋 Before Starting ANY Task

1. **Read these 5 documents in order**:
   - ✅ `README.md` - Project overview, architecture, developer guidelines
   - ✅ `DESIGN_SYSTEM.md` - UI components, patterns, styling rules
   - ✅ `docs/technical-prd.md` - Product requirements, features, roadmap
   - ✅ `CHANGELOG.md` - Recent changes, version history
   - ✅ `SETUP.md` - Environment setup, troubleshooting

2. **Understand the Context7 principle** (from README.md):
   - Minimal state
   - Service layer pattern (never call Supabase directly from components)
   - Optimistic updates with rollback
   - Fetch-once pattern to prevent duplicate API calls

3. **Review the design system** (DESIGN_SYSTEM.md):
   - Dark theme colors, spacing, typography
   - Existing component patterns
   - Dark Fantasy Charm philosophy

---

## 🚫 CRITICAL RULES (Do NOT Violate)

### Documentation: 5-Document Limit (STRICT)

**This project maintains EXACTLY 5 permanent documentation files:**

1. `README.md` - Project overview, quick start, developer guidelines
2. `SETUP.md` - Installation, troubleshooting, environment setup
3. `DESIGN_SYSTEM.md` - UI components, patterns, styling rules
4. `docs/technical-prd.md` - Product requirements, architecture, roadmap
5. `CHANGELOG.md` - Version history, features, breaking changes

**✅ DO:**
- Update existing docs when adding features
- Add sections to appropriate existing files
- Use code comments for implementation details

**❌ DON'T:**
- Create new .md files (IMPLEMENTATION_SUMMARY.md, QA_REPORT.md, PHASE_X.md, etc.)
- Create per-feature documentation
- Duplicate information across files
- Create migration guides, troubleshooting docs, or planning docs

**Exception:** Temporary working docs during major refactoring (DELETE after merge or archive in git history)

**When adding new features:**
- Component patterns → `DESIGN_SYSTEM.md`
- Setup instructions → `SETUP.md`
- Architecture changes → `docs/technical-prd.md`
- Developer guidelines → `README.md`
- Version updates → `CHANGELOG.md`

**Why this matters:** We consolidated 22 files to 5 with zero information loss. Don't undo that work.

---

### Code Quality Standards

**TypeScript:**
- Strict mode enabled (no `any` without explicit reason)
- No implicit any
- Interface for all component props

**React:**
- Functional components only
- Keep components <200 lines (extract sub-components if larger)
- Use custom hooks for shared logic
- Proper cleanup in useEffect

**State Management:**
- Zustand with Immer
- Enable MapSet plugin when using Map/Set
- Service layer for all database operations
- No direct Supabase calls from components

**Known Expected Warnings:**
- `TS2589: Type instantiation is excessively deep` on Immer+Map stores - This is expected and documented

---

### Design System Compliance

**Colors:**
- Background: `#111111`
- Surface: `#191919`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Use opacity for variations (`text-white/60`, `bg-white/10`)

**Spacing:**
- 8px base grid
- Use Tailwind classes

**Dark Fantasy Charm:**
- Subtle thematic touches in copy (not visuals)
- Don't use fantasy icons (swords, dragons)
- Keep it professional with personality

**Browser Extensions:**
- Add `data-1p-ignore="true"` and `data-lpignore="true"` to non-form editable fields

---

### Performance Requirements

**Targets:**
- Scene switch: <100ms
- Page load: <500ms to interactive
- Audio resume: <50ms
- Lighthouse score: >90

**Patterns:**
- Lazy loading for components
- Optimistic updates (update UI first, sync database in background)
- Fetch-once pattern (Set/boolean flags to prevent duplicate fetches)
- Batch database operations

---

## 🎯 Feature Tiers (What to Build)

### Tier 1: Essential (Production Ready ✅)
- User auth, campaigns, sessions, scenes
- Audio library with R2 upload
- Philips Hue integration
- Scene switching (<100ms)

### Tier 2: Enhanced (Production Ready ✅)
- Scene Blocks (infrastructure exists, UI reverted due to contentEditable issues)
- Scene NPCs (backend exists, UI placeholder)
- Advanced File Explorer (hierarchical, drag-drop)
- Audio Playlists

### Tier 3: Future (Explicitly Excluded from MVP)
- Combat tracker
- Dice roller (planned but not started)
- Session recording
- Shared campaigns
- Mobile app
- Voice control

**Before building anything in Tier 3, confirm with user that scope has changed.**

---

## 🔧 Common Pitfalls to Avoid

1. **Creating new .md files** - Use the 5 existing docs
2. **God components** - Break into sub-components at 200 lines
3. **Direct Supabase calls** - Always use service layer
4. **Skipping fetch-once checks** - Causes duplicate API calls
5. **Forgetting RLS** - All database operations must respect user isolation
6. **Magic numbers** - Use named constants
7. **Inline styles** - Use Tailwind classes
8. **Console.log** - Use logger utility for production code

---

## 📖 How to Use This File

### For AI Agents:
1. Read this file FIRST before starting any task
2. Reference the 5 core docs for specific details
3. Ask clarifying questions if anything conflicts
4. When in doubt, update existing docs (don't create new ones)

### For Humans:
1. Update this file when adding new critical rules
2. Keep it concise (single page)
3. Link to detailed docs for specifics
4. This is the "quick start" for agents

---

## ✅ Checklist Before Committing

- [ ] No new .md files created (except temporary working docs to be deleted)
- [ ] Updated appropriate existing docs (CHANGELOG, DESIGN_SYSTEM, PRD, etc.)
- [ ] Components <200 lines
- [ ] TypeScript strict mode passes
- [ ] No direct Supabase calls from components
- [ ] Used service layer pattern
- [ ] Followed design system (colors, spacing, patterns)
- [ ] Dark Fantasy Charm where appropriate (subtle, not tacky)
- [ ] Proper error handling and logging
- [ ] Optimistic updates for better UX

---

**Last Updated**: October 18, 2025  
**Maintain this file**: Keep it under 200 lines, one screen of reading

