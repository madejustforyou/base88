/** Small uncompressed ZIP writer for three self-contained files, with no dependencies. */
export type ZipEntry={name:string;content:string}
function crc32(data:Uint8Array):number{
  let crc=0xffffffff
  for(const v of data){
    crc^=v
    for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)
  }
  return (crc^0xffffffff)>>>0
}
export function createLaunchZip(files:ZipEntry[]):ArrayBuffer{
  if(files.length<1 || files.length>8)throw new Error('ZIP requires 1–8 files')
  const encoder=new TextEncoder()
  const chunks:Uint8Array[]=[]
  const central:Uint8Array[]=[]
  const names=new Set<string>()
  let offset=0
  for(const {name,content} of files){
    if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(name)||name==='.'||name==='..'||names.has(name)) {
      throw new Error('Invalid or duplicate ZIP filename')
    }
    names.add(name)
    const fileName=encoder.encode(name)
    const data=encoder.encode(content)
    if(data.length>500_000)throw new Error('File exceeds ZIP limit')
    const checksum=crc32(data)
    const local=new Uint8Array(30+fileName.length+data.length)
    const l=new DataView(local.buffer)
    l.setUint32(0,0x04034b50,true)
    l.setUint16(4,20,true)
    l.setUint16(6,0x0800,true) // UTF-8 names
    l.setUint16(8,0,true) // Store uncompressed
    l.setUint32(14,checksum,true)
    l.setUint32(18,data.length,true)
    l.setUint32(22,data.length,true)
    l.setUint16(26,fileName.length,true)
    local.set(fileName,30)
    local.set(data,30+fileName.length)
    chunks.push(local)

    const record=new Uint8Array(46+fileName.length)
    const c=new DataView(record.buffer)
    c.setUint32(0,0x02014b50,true)
    c.setUint16(4,20,true)
    c.setUint16(6,20,true)
    c.setUint16(8,0x0800,true)
    c.setUint16(10,0,true)
    c.setUint32(16,checksum,true)
    c.setUint32(20,data.length,true)
    c.setUint32(24,data.length,true)
    c.setUint16(28,fileName.length,true)
    c.setUint32(42,offset,true)
    record.set(fileName,46)
    central.push(record)
    offset+=local.length
  }
  const centralSize=central.reduce((sum,c)=>sum+c.length,0)
  const eocd=new Uint8Array(22)
  const e=new DataView(eocd.buffer)
  e.setUint32(0,0x06054b50,true)
  e.setUint16(8,files.length,true)
  e.setUint16(10,files.length,true)
  e.setUint32(12,centralSize,true)
  e.setUint32(16,offset,true)
  const total=offset+centralSize+eocd.length
  const output=new ArrayBuffer(total)
  const out=new Uint8Array(output)
  let pos=0
  for(const c of [...chunks,...central,eocd]){out.set(c,pos);pos+=c.length}
  return output
}
