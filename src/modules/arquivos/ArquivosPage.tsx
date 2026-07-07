import { useQuery } from '@tanstack/react-query'
import { FileText, FileSpreadsheet, FileImage, File, Download } from 'lucide-react'
import { api } from '../../services/api'
import { PageHeader, StatTile, TableWrap, Th, Td, Loading } from '../../components/ui'
import { dateBR } from '../../lib/format'

const iconFor = (ext: string) => {
  if (['pdf', 'doc', 'txt'].includes(ext)) return <FileText size={16} className="text-rose-500" />
  if (['xlsx', 'csv'].includes(ext)) return <FileSpreadsheet size={16} className="text-emerald-500" />
  if (['png', 'jpg', 'fig'].includes(ext)) return <FileImage size={16} className="text-violet-500" />
  return <File size={16} className="text-slate-400" />
}

const sizeFmt = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)

export function ArquivosPage() {
  const { data, isLoading } = useQuery({ queryKey: ['files'], queryFn: api.getFiles })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  if (isLoading) return <Loading />

  const rows = data ?? []
  const userOf = (id: string) => users?.find((u) => u.id === id)?.name ?? '—'
  const totalKb = rows.reduce((s, r) => s + r.sizeKb, 0)

  return (
    <div>
      <PageHeader title="Arquivos" subtitle="Documentos e anexos vinculados a projetos e clientes" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Arquivos" value={rows.length} />
        <StatTile label="Armazenamento" value={sizeFmt(totalKb)} accent="text-indigo-500" />
        <StatTile label="Vínculos" value={new Set(rows.map((r) => r.entity)).size} accent="text-violet-500" />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Arquivo</Th>
            <Th>Vínculo</Th>
            <Th>Enviado por</Th>
            <Th>Tamanho</Th>
            <Th>Data</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <Td>
                <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  {iconFor(f.ext)} {f.name}.{f.ext}
                </span>
              </Td>
              <Td className="text-xs text-slate-500">{f.entity}</Td>
              <Td>{userOf(f.uploadedBy)}</Td>
              <Td className="text-xs">{sizeFmt(f.sizeKb)}</Td>
              <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(f.date)}</Td>
              <Td>
                <button className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  <Download size={13} /> Baixar
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}
