import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'

const selectClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500'

let nextBlockId = 1

// Fasal+section kasta oo la doortay block-kan waxay noqonayaan hal
// TeacherAssignment. 'all' macnaheedu waa fasalka OO DHAN (dhammaan
// sections-kiisa) — isla xeerka backend-ku (sectionId: null).
function emptyBlock() {
  return { id: nextBlockId++, subjectId: '', selection: {} }
}

// defaultAssignments (backend flat list) -> blocks isku maado ah oo isku
// darsan (hal block = hal maado, dhowr fasal).
function blocksFromAssignments(assignments) {
  const bySubject = new Map()
  for (const a of assignments ?? []) {
    if (!a.subjectId) continue
    if (!bySubject.has(a.subjectId)) bySubject.set(a.subjectId, { id: nextBlockId++, subjectId: a.subjectId, selection: {} })
    const block = bySubject.get(a.subjectId)
    if (!a.sectionId) {
      block.selection[a.classId] = 'all'
    } else {
      const current = block.selection[a.classId]
      const set = current instanceof Set ? current : new Set()
      set.add(a.sectionId)
      block.selection[a.classId] = set
    }
  }
  const blocks = [...bySubject.values()]
  return blocks.length > 0 ? blocks : [emptyBlock()]
}

function blocksToAssignments(blocks, classes) {
  const out = []
  for (const block of blocks) {
    if (!block.subjectId) continue
    for (const [classId, value] of Object.entries(block.selection)) {
      const klass = classes.find((c) => c.id === classId)
      if (!klass) continue
      if (value === 'all' || !klass.hasSections) {
        out.push({ classId, sectionId: null, subjectId: block.subjectId })
      } else if (value instanceof Set) {
        for (const sectionId of value) out.push({ classId, sectionId, subjectId: block.subjectId })
      }
    }
  }
  return out
}

function classCount(block) {
  return Object.keys(block.selection).length
}

// classes: [{ id, name, hasSections, sectionItems: [{id,name}] }]
// subjects: subjectItems [{ id, name }]
// teachers: macallimiinta jira — loo isticmaalo in la hubiyo in section
// horjoogaha uu horey u lahaa macalin kale (hal horjoogo section kasta).
// defaultValues: macalinka la wax-ka-beddelayo (ama null = cusub).
function TeacherForm({ defaultValues, classes, subjects, teachers, onSubmit, onCancel }) {
  const isEdit = !!defaultValues

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      password: '',
      homeroomClassId: defaultValues?.classId ?? '',
      homeroomSectionId: defaultValues?.sectionId ?? '',
      isFeeManager: defaultValues?.isFeeManager ?? false,
    },
  })

  const [blocks, setBlocks] = useState(() => blocksFromAssignments(defaultValues?.assignments))

  const homeroomClassId = watch('homeroomClassId')
  const homeroomClass = classes.find((c) => c.id === homeroomClassId)

  // Hal macalin oo horjoogo ah section kasta (isla xeerka backend-ku).
  function homeroomTaken(sectionId) {
    if (!homeroomClassId) return true
    const holder = teachers.find(
      (t) =>
        t.id !== defaultValues?.id &&
        t.classId === homeroomClassId &&
        (homeroomClass?.hasSections ? t.sectionId === sectionId : true)
    )
    return holder
      ? `${holder.name} horeyba wuxuu horjoogo u yahay ${homeroomClass.name}${homeroomClass?.hasSections ? ' — section-kan' : ''}`
      : true
  }

  function updateBlock(id, patch) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function toggleClassAll(blockId, classId, checked) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b
        const selection = { ...b.selection }
        if (checked) selection[classId] = 'all'
        else delete selection[classId]
        return { ...b, selection }
      })
    )
  }

  function toggleSection(blockId, classId, sectionId, checked) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b
        const selection = { ...b.selection }
        const current = selection[classId]
        const set = current instanceof Set ? new Set(current) : new Set()
        if (checked) set.add(sectionId)
        else set.delete(sectionId)
        if (set.size === 0) delete selection[classId]
        else selection[classId] = set
        return { ...b, selection }
      })
    )
  }

  function addBlock() {
    setBlocks((prev) => [...prev, emptyBlock()])
  }

  function removeBlock(id) {
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : [emptyBlock()]))
  }

  const usedSubjectIds = new Set(blocks.map((b) => b.subjectId).filter(Boolean))

  async function submit(data) {
    const invalidBlock = blocks.find((b) => b.subjectId && classCount(b) === 0)
    if (invalidBlock) return // guarded by disabled submit below too

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      homeroom: data.homeroomClassId
        ? { classId: data.homeroomClassId, sectionId: homeroomClass?.hasSections ? data.homeroomSectionId : null }
        : null,
      assignments: blocksToAssignments(blocks, classes),
      isFeeManager: !!data.isFeeManager,
    }
    if (data.password) payload.password = data.password
    await onSubmit(payload)
  }

  const hasIncompleteBlock = blocks.some((b) => b.subjectId && classCount(b) === 0)

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Magaca macalinka"
          error={errors.name?.message}
          {...register('name', { required: 'Magaca waa loo baahan yahay' })}
        />
        <Input label="Telefoonka (ikhtiyaari)" {...register('phone')} />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email waa loo baahan yahay' })}
        />
        <Input
          label={isEdit ? 'Password cusub (ka tag madhan si aan loo beddelin)' : 'Password'}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: isEdit ? false : 'Password waa loo baahan yahay',
            minLength: { value: 6, message: 'Ugu yaraan 6 xaraf' },
          })}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
        <input type="checkbox" className="mt-0.5" {...register('isFeeManager')} />
        <span>
          <span className="block text-sm font-medium text-ink">Fee manager</span>
          <span className="block text-xs text-ink-muted">
            Macalinkan wuxuu geli karaa bogga Fees, wuxuuna maamuli karaa lacagaha ardayda. Haddii
            aan la calaamadin, wuxuu noqonayaa macalin caadi ah.
          </span>
        </span>
      </label>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-sm font-medium text-ink">Horjoogaha fasalka (attendance) — ikhtiyaari</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <select
              className={selectClass}
              {...register('homeroomClassId', {
                validate: (value) => {
                  if (!value) return true
                  if (classes.find((c) => c.id === value)?.hasSections) return true
                  return homeroomTaken(null)
                },
              })}
            >
              <option value="">Ma aha horjoogaha fasal</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.homeroomClassId && <p className="mt-1 text-xs text-danger-500">{errors.homeroomClassId.message}</p>}
          </div>
          {homeroomClass?.hasSections && (
            <div>
              <select
                className={selectClass}
                {...register('homeroomSectionId', {
                  required: 'Fasalkan sections buu leeyahay — dooro mid',
                  validate: (value) => homeroomTaken(value),
                })}
              >
                <option value="">-- Dooro section --</option>
                {homeroomClass.sectionItems.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
              {errors.homeroomSectionId && <p className="mt-1 text-xs text-danger-500">{errors.homeroomSectionId.message}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Maadooyinka uu dhigo</p>
            <p className="text-xs text-ink-muted">
              Maado kastaa dhowr fasal buu ku dhigi karaa (tusaale: Xisaab — Fasalka 3, 4, 5 A) — dooro
              fasallada/sections-ka hoos.
            </p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={addBlock} disabled={subjects.length === 0}>
            <Plus size={14} />
            Maado
          </Button>
        </div>
        {(classes.length === 0 || subjects.length === 0) && (
          <p className="text-xs text-ink-muted">
            Marka hore ku dar fasallo (Students) iyo maadooyin (Maamul maadooyinka).
          </p>
        )}
        <div className="flex flex-col gap-3">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-lg bg-canvas p-3">
              <div className="mb-2 flex items-center gap-2">
                <select
                  className={selectClass}
                  value={block.subjectId}
                  onChange={(e) => updateBlock(block.id, { subjectId: e.target.value })}
                >
                  <option value="">-- Dooro maado --</option>
                  {subjects
                    .filter((s) => s.id === block.subjectId || !usedSubjectIds.has(s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="shrink-0 p-1.5 text-ink-muted hover:text-danger-500"
                  aria-label="Ka saar maadadan"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {block.subjectId && (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {classes.map((klass) => {
                    const value = block.selection[klass.id]
                    if (!klass.hasSections) {
                      return (
                        <label key={klass.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-ink hover:bg-surface">
                          <input
                            type="checkbox"
                            checked={value === 'all'}
                            onChange={(e) => toggleClassAll(block.id, klass.id, e.target.checked)}
                          />
                          {klass.name}
                        </label>
                      )
                    }
                    return (
                      <div key={klass.id} className="rounded-md px-2 py-1">
                        <label className="flex items-center gap-2 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={value === 'all'}
                            onChange={(e) => toggleClassAll(block.id, klass.id, e.target.checked)}
                          />
                          {klass.name} <span className="text-xs text-ink-muted">(dhammaan sections)</span>
                        </label>
                        <div className="ml-6 mt-0.5 flex flex-wrap gap-2">
                          {klass.sectionItems.map((sec) => (
                            <label key={sec.id} className="flex items-center gap-1 text-xs text-ink-muted">
                              <input
                                type="checkbox"
                                disabled={value === 'all'}
                                checked={value instanceof Set && value.has(sec.id)}
                                onChange={(e) => toggleSection(block.id, klass.id, sec.id, e.target.checked)}
                              />
                              {sec.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {block.subjectId && classCount(block) === 0 && (
                <p className="mt-1.5 text-xs text-danger-500">Dooro ugu yaraan hal fasal maadadan</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Jooji
        </Button>
        <Button type="submit" disabled={isSubmitting || hasIncompleteBlock}>
          {isSubmitting ? 'Waa la keydinayaa...' : 'Keydi'}
        </Button>
      </div>
    </form>
  )
}

export default TeacherForm
