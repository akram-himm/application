import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import puppeteer from 'puppeteer';

class ChromeControllerMCP {
  constructor() {
    this.browser = null;
    this.page = null;

    this.server = new Server({
      name: 'chrome-controller',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'navigate',
          description: 'Navigate to a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string' }
            },
            required: ['url']
          }
        },
        {
          name: 'get_content',
          description: 'Get page HTML content',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' }
            }
          }
        },
        {
          name: 'modify_content',
          description: 'Modify element content',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['selector', 'content']
          }
        },
        {
          name: 'click',
          description: 'Click an element',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' }
            },
            required: ['selector']
          }
        },
        {
          name: 'type',
          description: 'Type text in an input',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              text: { type: 'string' }
            },
            required: ['selector', 'text']
          }
        },
        {
          name: 'execute_script',
          description: 'Execute JavaScript in the page',
          inputSchema: {
            type: 'object',
            properties: {
              script: { type: 'string' }
            },
            required: ['script']
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: false,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
      }

      switch (name) {
        case 'navigate':
          await this.page.goto(args.url, { waitUntil: 'networkidle2' });
          return { content: [{ type: 'text', text: `Navigated to ${args.url}` }] };

        case 'get_content':
          const content = args.selector
            ? await this.page.$eval(args.selector, el => el.innerHTML)
            : await this.page.content();
          return { content: [{ type: 'text', text: content }] };

        case 'modify_content':
          await this.page.evaluate((selector, content) => {
            const element = document.querySelector(selector);
            if (element) {
              element.innerHTML = content;
            }
          }, args.selector, args.content);
          return { content: [{ type: 'text', text: `Modified content of ${args.selector}` }] };

        case 'click':
          await this.page.click(args.selector);
          return { content: [{ type: 'text', text: `Clicked ${args.selector}` }] };

        case 'type':
          await this.page.type(args.selector, args.text);
          return { content: [{ type: 'text', text: `Typed text in ${args.selector}` }] };

        case 'execute_script':
          const result = await this.page.evaluate(args.script);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Chrome Controller MCP Server started');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const mcp = new ChromeControllerMCP();
mcp.start().catch(console.error);

process.on('SIGINT', async () => {
  await mcp.cleanup();
  process.exit(0);
});