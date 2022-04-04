import { readFile, writeFile } from './Data'
import PromisifyFileReader from 'promisify-file-reader'
import Startup from './Startup'
import Vue from 'vue'
import { store } from '@/store'
import { DeleteAll } from '@/cloud/item_sync'

const files = [
  'user.config',
  'active_missions_v2.json',
  'missions_v2.json',
  'encounters_v2.json',
  'pilots_v2.json',
  'npcs_v2.json',
  'extra_content.json',
  'pilot_groups_v2.json',
]

const exportV1Pilots = async function (): Promise<string> {
  return readFile('pilots.json')
}

interface IBulkExport {
  filename: string
  data: string
}

const exportAll = async function (): Promise<IBulkExport[]> {
  const promises = files.map(file => readFile(file))

  const res = await Promise.all(promises)

  return res.map((data, i) => ({ filename: files[i], data }))
}

const importAll = async function (file): Promise<void> {
  const text = await PromisifyFileReader.readAsText(file)
  const arr = JSON.parse(text)
  console.info('Loading import data...')
  const promises = arr.map(o => writeFile(o.filename, o.data))
  await Promise.all(promises)
  // await store.dispatch('cloudSync', { callback: null, condition: 'bulkDelete' }).catch(e => console.error(e))
  console.info('Import data loaded! Running startup...')
  await Startup(Vue.prototype.$appVersion, Vue.prototype.$lancerVersion, store)
}

const clearAllData = async function (clear_cloud: boolean): Promise<void> {
  console.info('Erasing all COMP/CON data...')
  for (const file of files) {
    localStorage.removeItem(file)
  }

  if (clear_cloud) {
    await DeleteAll()
  }

  console.info('All data erased! Running startup...')
  await Startup(Vue.prototype.$appVersion, Vue.prototype.$lancerVersion, store)
}

export { exportV1Pilots, exportAll, importAll, clearAllData }
