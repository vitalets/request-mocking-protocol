import { spawn } from 'child_process';

function startProcess(command, args = [], successMessage = '', cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`Starting process: ${command} ${args.join(' ')} in ${cwd}`);
    const processInstance = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: true,
      cwd,
    });

    processInstance.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (successMessage && output.includes(successMessage)) {
        console.log('Process launched successfully.');
        resolve(processInstance);
      }
    });

    processInstance.on('error', (error) => {
      console.error('Error starting process:', error);
      reject(error);
    });

    processInstance.on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      reject(new Error(`Process exited unexpectedly with code ${code}`));
    });
  });
}

function stopProcess(processInstance) {
  return new Promise((resolve, reject) => {
    if (!processInstance) {
      console.log('No process is running.');
      return reject(new Error('No process is running.'));
    }

    console.log('Stopping process...');
    // processInstance.kill('SIGINT');
    processInstance.kill('SIGKILL');
    resolve();
  });
}

process.on('SIGINT', async () => {
  console.log('\nCaught interrupt signal.');
  process.exit();
});

process.on('SIGTERM', async () => {
  console.log('\nReceived termination signal.');
  process.exit();
});

export { startProcess, stopProcess };
