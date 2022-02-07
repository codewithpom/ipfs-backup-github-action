import * as core from '@actions/core'
import {Web3Storage, getFilesFromPath} from 'web3.storage'
import child_process from 'child_process'
import fs from 'fs'

async function run(): Promise<void> {
  const token_: string = core.getInput('web3_token')
  const folder_to_store_archive: string = core.getInput('folder')
  const client = new Web3Storage({
    token: token_
  })

  const files = await getFilesFromPath('.', {
    hidden: true
  })

  for (const file of files) {
    const arr = file.name.split('/')
    arr.splice(0, 2)
    file.name = arr.join('/')
  }
  // console.log(files)
  core.debug('Uploading files')
  // @ts-ignore
  const cid: string = await client.put(files)
  const time = Math.floor(new Date().getTime() / 1000)
  const lastCommitHash = child_process
    .execSync('git show -s --format=%H')
    .toString()
  const lastCommitMessage = child_process
    .execSync("git log -1 --oneline --format=%s | sed 's/^.*: //'")
    .toString()
  if (!fs.existsSync(folder_to_store_archive)) {
    fs.mkdirSync(folder_to_store_archive, {})
  }
  fs.writeFileSync(
    `${folder_to_store_archive}/${time}.json`,
    JSON.stringify({
      TimeWhenArchiveWasMade: time.toString(),
      LastCommitHash: lastCommitHash,
      LastCommitMessage: lastCommitMessage,
      UrlToIPFS: `https://${cid}.ipfs.dweb.link`
    })
  )
  // Removed as they do not currently support deleting for API but later on they will use it
  // wait(5000)
  // axios.delete(`https://api.web3.storage/user/uploads/${cid}`, {
  //   headers: {
  //     authorization: `Bearer ${token_}`
  //   }
  // })
}

run()
