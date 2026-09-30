import { useStudents } from '@/hooks/useStudents'
import { useSearch } from '@/hooks/useSearch'
import { Card, Table } from '@/components/ui'

function GraduatesPage() {
  const { students, graduates: allGraduates } = useStudents()
  const { query } = useSearch()
  const graduates = allGraduates.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Ardayda ka qalin-jabiyay</h1>
      <p className="mb-3 text-xs text-ink-muted">
        Ardayda guud (firfircoon): <strong>{students.filter((s) => s.status === 'active').length}</strong>
        {' '}· Ka qalin-jabiyay: <strong>{graduates.length}</strong>
      </p>
      <Card className="p-0">
        <Table
          columns={[
            { key: 'studentCode', label: 'ID' },
            { key: 'name', label: 'Magaca' },
            { key: 'class', label: 'Fasalkii ugu dambeeyay', render: (row) => row.class ? `${row.class}${row.section ? ` · ${row.section}` : ''}` : '—' },
            { key: 'parentPhone', label: 'Telefoonka waalidka' },
            {
              key: 'graduatedDate',
              label: 'Taariikhda dhamaystirka',
              render: (row) => row.graduatedDate ?? '—',
            },
          ]}
          data={graduates}
          emptyMessage="Weli qof kama qalin-jabin"
        />
      </Card>
    </div>
  )
}

export default GraduatesPage
