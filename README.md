<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/banner-light.svg" />
  <img alt="Nelo M. — Product Engineer: SaaS, Web3 &amp; Spec-Driven Development" src="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/banner-light.svg" width="100%" />
</picture>

<p align="center">
  <a href="https://criptonlabs.com"><kbd>&nbsp;Criptonlabs&nbsp;</kbd></a>&nbsp;
  <a href="https://criptofolio.criptonlabs.com/"><kbd>&nbsp;Criptofolio&nbsp;</kbd></a>&nbsp;
  <a href="https://nelomr.github.io/components-kit/"><kbd>&nbsp;Storybook hub&nbsp;</kbd></a>
</p>

Product Engineer with ~10 years of experience architecting production SaaS interfaces, dual-framework design systems, high-throughput visualization engines, and local-first software.

> [!NOTE]
> **Currently building:** 60 FPS headless telemetry rendering ([`trace-kit`](https://github.com/nelomr/trace-kit)), local-first crypto wealth and FIFO tax accounting ([`criptofolio`](https://github.com/nelomr/criptofolio)), and AI agent infrastructure with MCP and x402 on-chain payments ([`criptonlabs`](https://github.com/criptonlabs)).

## Selected work

<table>
<tr>
<td width="50%" valign="top">

### [trace-kit](https://github.com/nelomr/trace-kit)

<sub>Pre-alpha, MIT</sub>

Headless visualization engine for time-series and physical signals, built to pan and zoom 10⁵–10⁶ points at 60 FPS. Canvas2D and WebGL2 renderers, zero-copy Web Worker transport, LTTB and Min-Max decimation. Vue and React bindings are planned.

`TypeScript` `WebGL2` `Canvas2D` `Web Workers` `Turborepo`

</td>
<td width="50%" valign="top">

### [criptofolio](https://github.com/nelomr/criptofolio)

<sub>AGPL-3.0</sub>

Privacy-first crypto portfolio with a FIFO tax engine for the Spanish AEAT. Hexagonal architecture, SQLite and DuckDB engines, an AES-256-GCM local vault and a read-only AI advisor (Ollama or cloud).

`TypeScript` `Vue 3` `SQLite` `DuckDB` `Local-first`

</td>
</tr>
<tr>
<td width="50%" valign="top">

### [components-kit](https://github.com/nelomr/components-kit)

<sub>MIT, <a href="https://nelomr.github.io/components-kit/">live Storybook</a></sub>

Dual-framework UI library: 14 Vue 3 and 14 React 19 components built from single-source SCSS, WCAG 2.1 AA compliant and fully tree-shakeable.

`Vue 3` `React 19` `Vite+ (Rolldown)` `Storybook 10` `Nx`

</td>
<td width="50%" valign="top">

### [agent-apis-sdk](https://github.com/criptonlabs/agent-apis-sdk)

<sub>Pre-release, Apache-2.0</sub>

TypeScript SDK that lets AI agents query XRP Ledger and Solana data through MCP, Vercel AI SDK, Mastra and ElizaOS tools, with opt-in x402 stablecoin payments in RLUSD, USDC and EURC.

`TypeScript` `MCP` `XRPL` `Solana` `x402`

</td>
</tr>
<tr>
<td colspan="2" valign="top">

### [claude-mods](https://github.com/nelomr/claude-mods)

<sub>MIT</sub>

Local-first plugin marketplace for Claude Code (`kolen-plugins`). Its `kolen-sdd-progress` mod tracks OpenSpec phases and blockers in real time with zero token overhead.

`TypeScript` `Claude Code` `OpenSpec`

</td>
</tr>
</table>

## Recent activity

<!-- ACTIVITY:START -->
| Repository | Updated | Latest commit or release |
| :--- | :--- | :--- |
| [`nelomr/trace-kit`](https://github.com/nelomr/trace-kit) | `2026-11-25` | [`v0.0.13`](https://github.com/nelomr/trace-kit/releases/tag/v0.0.13) [chore(release): version packages \[skip ci\]](https://github.com/nelomr/trace-kit/commit/8dbb3541a3a876b525420d5d2f6300f312e3b10e) |
| [`criptonlabs/agent-apis-sdk`](https://github.com/criptonlabs/agent-apis-sdk) | `2026-11-24` | [`@criptonlabs/agent-apis-xrpl@0.0.2`](https://github.com/criptonlabs/agent-apis-sdk/releases/tag/%40criptonlabs/agent-apis-xrpl%400.0.2) [chore: version packages (#2)](https://github.com/criptonlabs/agent-apis-sdk/commit/61e7c64aec0d575fc241a0c2e860ff43171182fd) |
| [`nelomr/claude-mods`](https://github.com/nelomr/claude-mods) | `2026-10-25` | [chore: drop types field from plugin manifest](https://github.com/nelomr/claude-mods/commit/94b2a05025cd37019398a4883f4cc4d2df5aec25) |
| [`nelomr/components-kit`](https://github.com/nelomr/components-kit) | `2026-10-24` | [feat(monorepo): introduce multi-framework architecture with vue 3 a…](https://github.com/nelomr/components-kit/commit/9f9a53795356617a11067ff3827f998ec8f4ab50) |
| [`nelomr/criptofolio`](https://github.com/nelomr/criptofolio) | `2026-10-17` | [chore(release): set initial pre-stable version 0.1.0](https://github.com/nelomr/criptofolio/commit/2f652d8bbbee54af6bd57f664039fc0abed610fc) |

<sub>Updated daily by GitHub Actions. Last change: 2026-11-25 (UTC).</sub>
<!-- ACTIVITY:END -->

## Engineering principles

- **Spec-driven development.** Contracts, OpenSpec artifacts and deterministic quality gates come before implementation, especially when AI coding agents write the code.
- **Clean, hexagonal boundaries.** Domain logic stays decoupled from frameworks, storage engines and transport layers.
- **Performance as a feature.** Zero-copy typed buffers, off-main-thread Web Workers and predictable rendering pipelines over premature abstractions.
- **Local-first by default.** Sensitive operational and financial data belongs on the user's machine with verifiable encryption, not inside third-party clouds.

<details>
<summary><b>Stack and toolchain</b></summary>
<br />

| Area | Tools |
| :--- | :--- |
| Frontend and UI | `Vue 3` `Pinia` `Pinia Colada` `React 19` `TypeScript` `Tailwind CSS` `SCSS (BEM)` `Storybook 10` |
| Graphics and data viz | `WebGL2` `Canvas2D` `Web Workers` `TypedArrays` `LTTB` `Min-Max decimation` |
| Data and local-first | `SQLite` `DuckDB` `Parquet` `AES-256-GCM` `Hexagonal architecture` |
| Monorepos and quality | `pnpm workspaces` `Turborepo` `Lerna` `Nx` `Vite+ (Rolldown)` `Vitest` `Visual regression` `Commitlint` `Gitleaks` |
| AI and Web3 | `Claude Code plugins` `OpenSpec` `MCP` `Vercel AI SDK` `XRP Ledger` `Solana` `x402` |

</details>

## GitHub stats and languages

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/metrics-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/metrics-light.svg" />
  <img alt="GitHub stats, most used languages and an isometric calendar of the last 26 weeks of contributions" src="https://raw.githubusercontent.com/nelomr/nelomr/main/assets/metrics-light.svg" width="100%" />
</picture>
