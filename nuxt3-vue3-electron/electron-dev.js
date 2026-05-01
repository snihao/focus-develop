/**
 * Electron 开发模式启动脚本
 * 自动启动 Nuxt 开发服务器和 Electron
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 检查依赖
function checkDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  const requiredDeps = ['nuxt', 'vue', 'electron', 'naive-ui']
  const missingDeps = []

  for (const dep of requiredDeps) {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      missingDeps.push(dep)
    }
  }

  if (missingDeps.length > 0) {
    log(`缺少依赖: ${missingDeps.join(', ')}`, 'red')
    log('请运行: npm install', 'yellow')
    process.exit(1)
  }
}

// 启动 Nuxt 开发服务器
function startNuxtDev() {
  return new Promise((resolve, reject) => {
    log('启动 Nuxt 开发服务器...', 'cyan')

    const nuxt = spawn('npx', ['nuxt', 'dev'], {
      stdio: 'pipe',
      shell: true,
    })

    let output = ''

    nuxt.stdout.on('data', (data) => {
      const message = data.toString()
      output += message

      // 检查是否启动成功
      if (message.includes('Local:') || message.includes('localhost:3000')) {
        log('Nuxt 开发服务器已启动', 'green')
        resolve(nuxt)
      }

      // 输出 Nuxt 日志
      if (message.trim()) {
        log(`[Nuxt] ${message.trim()}`, 'dim')
      }
    })

    nuxt.stderr.on('data', (data) => {
      const message = data.toString()
      if (message.includes('ERROR') || message.includes('Error')) {
        log(`[Nuxt 错误] ${message.trim()}`, 'red')
      }
    })

    nuxt.on('error', (error) => {
      log(`启动 Nuxt 失败: ${error.message}`, 'red')
      reject(error)
    })

    // 超时处理
    setTimeout(() => {
      if (!output.includes('Local:') && !output.includes('localhost:3000')) {
        log('Nuxt 启动超时', 'yellow')
        resolve(nuxt)
      }
    }, 30000)
  })
}

// 启动 Electron
function startElectron() {
  return new Promise((resolve, reject) => {
    log('启动 Electron...', 'cyan')

    const electron = spawn('npx', ['electron', '.'], {
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ELECTRON_DEV_MODE: 'true',
      },
    })

    electron.stdout.on('data', (data) => {
      const message = data.toString()
      if (message.trim()) {
        log(`[Electron] ${message.trim()}`, 'dim')
      }
    })

    electron.stderr.on('data', (data) => {
      const message = data.toString()
      if (message.includes('ERROR') || message.includes('Error')) {
        log(`[Electron 错误] ${message.trim()}`, 'red')
      }
    })

    electron.on('error', (error) => {
      log(`启动 Electron 失败: ${error.message}`, 'red')
      reject(error)
    })

    electron.on('close', (code) => {
      if (code !== 0) {
        log(`Electron 已退出，代码: ${code}`, 'yellow')
      }
      resolve(electron)
    })

    resolve(electron)
  })
}

// 主函数
async function main() {
  log('=== Nuxt Electron 开发环境 ===', 'bright')
  log('')

  try {
    // 检查依赖
    checkDependencies()

    // 启动 Nuxt
    const nuxtProcess = await startNuxtDev()

    // 等待 Nuxt 完全启动
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 启动 Electron
    const electronProcess = await startElectron()

    // 处理进程退出
    process.on('SIGINT', () => {
      log('\n正在关闭开发环境...', 'yellow')
      nuxtProcess.kill()
      electronProcess.kill()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      log('\n正在关闭开发环境...', 'yellow')
      nuxtProcess.kill()
      electronProcess.kill()
      process.exit(0)
    })

    // 监听子进程退出
    electronProcess.on('close', () => {
      log('Electron 已关闭，正在停止 Nuxt...', 'yellow')
      nuxtProcess.kill()
      process.exit(0)
    })

    log('')
    log('开发环境已启动！', 'green')
    log('按 Ctrl+C 关闭开发环境', 'dim')
    log('')

  } catch (error) {
    log(`启动失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 运行主函数
main()
