'use client'

import { useState, useEffect } from 'react'
import type { SceneNPC } from '@/types'
import { useSceneNPCStore } from '@/store/sceneNPCStore'
import { BaseModal } from '@/components/ui/BaseModal'

interface NPCModalProps {
  isOpen: boolean
  onClose: () => void
  sceneId: string
  npc?: SceneNPC | null
}

/**
 * NPCModal - Create/edit NPC with stats
 * Context7: Design system modal pattern
 */
export function NPCModal({ isOpen, onClose, sceneId, npc }: NPCModalProps) {
  const createNPC = useSceneNPCStore((state) => state.actions.create)
  const updateNPC = useSceneNPCStore((state) => state.actions.update)
  const npcsMap = useSceneNPCStore((state) => state.npcs)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hp, setHp] = useState('')
  const [ac, setAc] = useState('')
  const [speed, setSpeed] = useState('')
  const [str, setStr] = useState('')
  const [dex, setDex] = useState('')
  const [con, setCon] = useState('')
  const [int, setInt] = useState('')
  const [wis, setWis] = useState('')
  const [cha, setCha] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load NPC data when editing
  useEffect(() => {
    if (npc) {
      setName(npc.name || '')
      setDescription(npc.description || '')
      setHp(npc.stats?.hp ? String(npc.stats.hp) : '')
      setAc(npc.stats?.ac ? String(npc.stats.ac) : '')
      setSpeed(npc.stats?.speed ? String(npc.stats.speed) : '')
      const abilities = npc.stats?.abilities as Record<string, number> | undefined
      setStr(abilities?.STR ? String(abilities.STR) : '')
      setDex(abilities?.DEX ? String(abilities.DEX) : '')
      setCon(abilities?.CON ? String(abilities.CON) : '')
      setInt(abilities?.INT ? String(abilities.INT) : '')
      setWis(abilities?.WIS ? String(abilities.WIS) : '')
      setCha(abilities?.CHA ? String(abilities.CHA) : '')
    } else {
      // Reset form for new NPC
      setName('')
      setDescription('')
      setHp('')
      setAc('')
      setSpeed('')
      setStr('')
      setDex('')
      setCon('')
      setInt('')
      setWis('')
      setCha('')
    }
  }, [npc, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)

    try {
      const abilities: Record<string, number> = {}
      if (str) abilities.STR = parseInt(str)
      if (dex) abilities.DEX = parseInt(dex)
      if (con) abilities.CON = parseInt(con)
      if (int) abilities.INT = parseInt(int)
      if (wis) abilities.WIS = parseInt(wis)
      if (cha) abilities.CHA = parseInt(cha)

      const npcData = {
        scene_id: sceneId,
        name: name.trim(),
        description: description.trim() || undefined,
        stats: {
          hp: hp ? parseInt(hp) : undefined,
          ac: ac ? parseInt(ac) : undefined,
          speed: speed.trim() || undefined,
          abilities: Object.keys(abilities).length > 0 ? abilities : undefined,
        },
        order_index: npc?.order_index ?? Array.from(npcsMap.values()).filter(n => n.scene_id === sceneId).length,
      }

      if (npc) {
        await updateNPC(npc.id, npcData)
      } else {
        await createNPC(npcData)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save NPC:', error)
      alert('Failed to save NPC. Migration 015 may not be applied yet.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={npc ? 'Edit Enemy' : 'Create Enemy'}
      width="w-[500px]"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : npc ? 'Update' : 'Create'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="npc-name" className="block text-[13px] text-white/70 mb-2">
            Name
          </label>
          <input
            id="npc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goblin Warrior"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="npc-description" className="block text-[13px] text-white/70 mb-2">
            Description
          </label>
          <textarea
            id="npc-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A fierce goblin with a rusty sword..."
            rows={3}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors resize-none"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* HP */}
          <div>
            <label htmlFor="npc-hp" className="block text-[13px] text-white/70 mb-2">
              HP
            </label>
            <input
              id="npc-hp"
              type="number"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              placeholder="25"
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* AC */}
          <div>
            <label htmlFor="npc-ac" className="block text-[13px] text-white/70 mb-2">
              AC
            </label>
            <input
              id="npc-ac"
              type="number"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              placeholder="14"
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Speed */}
        <div>
          <label htmlFor="npc-speed" className="block text-[13px] text-white/70 mb-2">
            Speed
          </label>
          <input
            id="npc-speed"
            type="text"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            placeholder="30 ft."
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Abilities */}
        <div>
          <div className="text-[13px] text-white/70 mb-2">Abilities</div>
          <div className="grid grid-cols-3 gap-3">
            {/* STR */}
            <div>
              <label htmlFor="npc-str" className="block text-[11px] text-white/50 mb-1 uppercase">
                STR
              </label>
              <input
                id="npc-str"
                type="number"
                value={str}
                onChange={(e) => setStr(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* DEX */}
            <div>
              <label htmlFor="npc-dex" className="block text-[11px] text-white/50 mb-1 uppercase">
                DEX
              </label>
              <input
                id="npc-dex"
                type="number"
                value={dex}
                onChange={(e) => setDex(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* CON */}
            <div>
              <label htmlFor="npc-con" className="block text-[11px] text-white/50 mb-1 uppercase">
                CON
              </label>
              <input
                id="npc-con"
                type="number"
                value={con}
                onChange={(e) => setCon(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* INT */}
            <div>
              <label htmlFor="npc-int" className="block text-[11px] text-white/50 mb-1 uppercase">
                INT
              </label>
              <input
                id="npc-int"
                type="number"
                value={int}
                onChange={(e) => setInt(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* WIS */}
            <div>
              <label htmlFor="npc-wis" className="block text-[11px] text-white/50 mb-1 uppercase">
                WIS
              </label>
              <input
                id="npc-wis"
                type="number"
                value={wis}
                onChange={(e) => setWis(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* CHA */}
            <div>
              <label htmlFor="npc-cha" className="block text-[11px] text-white/50 mb-1 uppercase">
                CHA
              </label>
              <input
                id="npc-cha"
                type="number"
                value={cha}
                onChange={(e) => setCha(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[13px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  )
}
