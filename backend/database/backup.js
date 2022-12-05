
//must replace by using the docker ENV. example: env.url ... 
url = 'mongodb://127.0.0.1:27017';
let filePath = './';
let cmd_for_export = 'mongodump  --uri=${url}  --db=test  --out=./';
let cmd_for_import = 'mongorestore --uri=${url}  --nsInclude=Hello ./test';

const dbBackExport = () => {
  child_process.exec(cmd_for_export, (error, stdout, stderr) => {
    console.log([cmd_for_export, error, filePath,stdout,stderr]);
  });
};

const dbBackImport = () => {
    child_process.exec(cmd_for_import, (error, stdout, stderr) => {
      console.log([cmd_for_import, error, filePath,stdout,stderr]);
    });
};
