import { useForm } from 'react-hook-form'
import { Button, Input } from '@/components/ui'

// classes: [{ id, name, hasSections, sectionItems: [{id,name}] }] — ardayga
// waxaa loo diraa classId/sectionId (ma aha magacyo).
// schools: iskuullada kale ee la wareejin karo [{ id, name }] (backend-ka).
// onTransfer(school | null): wareejin dhab ah (POST /students/:id/transfer).
function StudentForm({ defaultValues, classes, schools = [], onSubmit, onCancel, onTransfer }) {
  const isEdit = !!defaultValues
  const originalStatus = defaultValues?.status
  // Ardayda transferred/graduated fasalkooda iyo xaaladdooda lama beddeli karo.
  const locked = isEdit && originalStatus !== 'active' && originalStatus !== 'withdrawn'
  const classLocked = isEdit && originalStatus !== 'active'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          classId: defaultValues.classId ?? '',
          sectionId: defaultValues.sectionId ?? '',
          dob: defaultValues.dob,
          parentName: defaultValues.parentName,
          parentPhone: defaultValues.parentPhone,
          feeCategory: defaultValues.feeCategory,
          discountAmount: defaultValues.discountAmount ?? undefined,
          status: defaultValues.status,
        }
      : { classId: classes[0]?.id ?? '', sectionId: '', feeCategory: 'paid', status: 'active' },
  })

  const selectedClassId = watch('classId')
  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const status = watch('status')
  const feeCategory = watch('feeCategory')

  async function handleFormSubmit(data) {
    const cleaned = {
      ...data,
      sectionId: selectedClass?.hasSections ? data.sectionId : null,
      discountAmount: data.feeCategory === 'discount' ? data.discountAmount : null,
    }
    await onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <Input
        label="Magaca ardayga"
        error={errors.name?.message}
        {...register('name', { required: 'Magaca waa loo baahan yahay' })}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Fasalka
        </label>
        <select
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          disabled={classLocked}
          {...register('classId', { required: true })}
        >
          {classes.length === 0 && <option value="">Wali fasal lama darin</option>}
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClass?.hasSections && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Section-ka
          </label>
          <select
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            disabled={classLocked}
            {...register('sectionId', {
              required: 'Fasalkan sections buu leeyahay — waa in la doortaa mid (A, B...)',
            })}
          >
            <option value="">-- Dooro section --</option>
            {selectedClass.sectionItems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.sectionId && (
            <p className="mt-1 text-xs text-danger-500">{errors.sectionId.message}</p>
          )}
        </div>
      )}

      <Input
        label="Taariikhda dhalashada"
        type="date"
        error={errors.dob?.message}
        {...register('dob', { required: 'Taariikhda waa loo baahan tahay' })}
      />
      <Input
        label="Magaca waalidka"
        error={errors.parentName?.message}
        {...register('parentName', {
          required: 'Magaca waalidka waa loo baahan yahay',
        })}
      />
      <Input
        label="Telefoonka waalidka"
        placeholder="06XXXXXXXX"
        error={errors.parentPhone?.message}
        {...register('parentPhone', {
          pattern: {
            value: /^0\d{9}$/,
            message: 'Lambarka waa in uu noqdaa 10 xaraf (0 ka bilaabma)',
          },
        })}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Lacagta (fee)
        </label>
        <select
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          {...register('feeCategory')}
        >
          <option value="paid">Paid — qiimaha caadiga ah</option>
          <option value="free">Free — waxba lagama rabo</option>
          <option value="discount">Discount — qayb laga jaray</option>
        </select>
      </div>

      {feeCategory === 'discount' && (
        <Input
          label="Intii laga jarayo ($)"
          type="number"
          error={errors.discountAmount?.message}
          {...register('discountAmount', {
            required: 'Qiimaha laga jarayo waa loo baahan yahay',
            valueAsNumber: true,
            min: { value: 0, message: 'Ma noqon karto mid taban' },
          })}
        />
      )}

      {isEdit && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Xaalad</label>
          <select
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            disabled={locked}
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>
      )}

      {isEdit && !locked && status === 'transferred' && onTransfer && (
        <div className="rounded-lg border border-warning-500 bg-warning-50 p-3">
          <p className="mb-2 text-sm font-medium text-ink">
            Dooro iskuulka arday-gan loo wareejinayo
          </p>
          <div className="flex flex-col gap-1.5">
            {schools.map((school) => (
              <button
                key={school.id}
                type="button"
                onClick={() => onTransfer(school)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-left text-sm text-ink hover:border-primary-500"
              >
                {school.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onTransfer(null)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-left text-sm text-ink hover:border-primary-500"
            >
              Other (iskuul aan systemka ku jirin)
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Marka aad iskuul doorato, xogta ardayga (magaca, waalidka, fasalka la
            mid ah) waxaa loo abuuraa arday cusub iskuulkaas, halkanna wuxuu
            noqonayaa "Transferred". Tan dib looma celin karo.
          </p>
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Jooji
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Waa la keydinayaa...' : 'Keydi'}
        </Button>
      </div>
    </form>
  )
}

export default StudentForm
