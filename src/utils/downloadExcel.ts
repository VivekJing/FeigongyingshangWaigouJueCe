import { utils, write, read, type ColInfo, type ParsingOptions } from 'xlsx';
import type { UploadRawFile } from 'element-plus';

/**
 * @param {Array} rows - 表格数据
 * @param {Array} headers - 表头数据
 * @param {string} fileName - 文件名称
 * @param {Array} headers - 表头修复
 */
export function renderExcel(
  rows: any[],
  headers: string[],
  fileName: string,
  fixHeader: string[] = [],
  cols?: ColInfo[]
) {
  const blob = createExcel(rows, headers, fixHeader, cols);
  openDownloadDialog(blob, fileName + '.xlsx');
}

export function createExcel(
  rows: any[],
  headers: string[],
  fixHeader: string[] = [],
  cols?: ColInfo[]
) {
  /* generate worksheet and workbook */
  const worksheet = utils.json_to_sheet(rows, { header: headers });
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Dates');

  /* calculate column width */
  if (cols) {
    worksheet['!cols'] = cols;
  } else {
    worksheet['!cols'] = [];
    headers.forEach((v) => {
      const max_width = rows.reduce(
        (w, r) => Math.max(w, r[v]?.length || 0),
        10
      );
      const maxWidth = Math.max(max_width, v.length);
      worksheet['!cols']!.push({ wch: maxWidth });
    });
  }

  /* fix headers */
  if (fixHeader.length !== 0)
    utils.sheet_add_aoa(worksheet, [fixHeader], { origin: 'A1' });

  /* create an XLSX file and try to save to Presidents.xlsx */
  const wbout = write(workbook, {
    bookType: 'xlsx', // 要生成的文件类型
    type: 'binary',
  });

  return new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  });
}

// 字符串转ArrayBuffer
function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
export function openDownloadDialog(url: Blob | string, saveName: string) {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  const aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event;
  if (window.MouseEvent) event = new MouseEvent('click');
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }
  aLink.dispatchEvent(event);
}

export function importFile(raw: UploadRawFile, opts: ParsingOptions = {}) {
  return new Promise<any[]>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = read(data, { type: 'binary', ...opts });
        const wsname = workbook.SheetNames[0];
        const ws = utils.sheet_to_json(workbook.Sheets[wsname]);
        console.log('数据：', ws);

        resolve(ws);
      } catch (error) {
        ElMessage.error('File errors: ' + error);
        console.log('解析文件出错：' + error);
        reject(error);
      }
    };
    // 以二进制方式打开文件
    fileReader.readAsArrayBuffer(raw);
  });
}
