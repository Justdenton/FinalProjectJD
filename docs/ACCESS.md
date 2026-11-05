# Access and hosting handoff

## Base Environment diagnosis — 2026-11-05 UTC

This is a new session's evidence, not inherited server authorization.

- Public repository cloning and GitHub connector reads work. PR #1 was open, draft and mergeable at `ac06240df6fb9e1832f9acd1120995810377002c`. There were no reviews, review threads, commit statuses, check runs or PR-triggered workflow runs for that commit. No `AGENTS.md` was found in the checkout or its parent paths.
- The GitHub connector reports repository push permission. Shell `gh auth status` reports an invalid `GH_TOKEN`; shell write access is not established. Connector authorization and shell authorization are separate.
- The managed environment reports current observations, enforced unrestricted HTTP networking, no secrets, no runtime variables and no outbound identities. The local network policy has no TCP grants and no configured VPN. Commands need their supported network permission enabled to reach the inherited proxy. Do not remove the proxy to work around a failed request.
- Git, curl, Python, a Java 21 runtime, Node/npm, Chromium and the Gradle wrapper are available. Base Environment lacks `javac`; a checksum-verified Temurin JDK 21 was installed in `/workspace/tools/jdk21` for validation. A global Gradle or Maven installation is unnecessary. The AWS CLI is absent; no AWS configuration or credentials file is present in `/workspace/.aws` and no AWS identity manifest is configured.
- The AWS Core connector returned “Authentication for AWS Core was requested and accepted. Retry this tool call now” on two attempts to call STS. Neither produced an identity or an executed AWS API record. AWS account, EC2 permissions and server access remain unverified.
- Base Environment defaults to Node 24. A checksum-verified Node 22 binary was installed in `/workspace/tools/node22` for this session. npm installation succeeds with a writable cache in `/workspace/.npm-cache`. These local tools and caches are not repository files.
- Java needs explicit HTTP/HTTPS proxy JVM properties derived from the inherited proxy for Gradle downloads. Preserve TLS verification and the environment's CA trust. Chromium's packaged sandbox helper is not usable here; an external, session-only test launcher was used inside the managed sandbox. The repository's Chrome launcher and CI retain browser sandboxing.

## Public HTTP diagnostics

Requests used the environment's HTTP proxy, TLS verification enabled, and no application credentials. These observations do not establish the reason for an origin failure.

| Check | Observed result |
| --- | --- |
| DNS A for `justdentondevelops.com` | `100.53.8.231` |
| `http://justdentondevelops.com/` | 200, title `JD Portfolio` |
| Portfolio's NeighborNet link | `http://justdentondevelops.com:8080/NeighborNet/` |
| `http://justdentondevelops.com/NeighborNet/` | 404 |
| `http://justdentondevelops.com:8080/NeighborNet/` | No response within 18 seconds |
| `https://justdentondevelops.com/` | Proxy returned 503 with an upstream connection failure |
| `http://justdentondevelops.com/expensetracker/` | 200 |
| `http://justdentondevelops.com/fraudindicator/` | 200 |
| README historical host `18.188.167.170:8080/NeighborNet/` | No response within 12 seconds |
| README historical host `3.137.134.246:8080/NeighborNet/` | No response within 12 seconds |

The DNS address cannot yet be mapped to an owned EC2 instance. A timeout does not prove a security-group rule, host failure or memory exhaustion. Historical Tomcat OOM and missing Systems Manager registrations have not been rechecked. The proxy's TLS result does not verify the origin certificate or HTTPS configuration. HTTP 200 on the other projects verifies their entry pages only.

## Local validation in this session

With Node 22.23.4 and JDK 21.0.13, all 11 focused frontend tests and all 8 root backend tests passed. Both backend test suites' output confirmed the isolated H2 connection. `:bootWar` rebuilt Angular and produced the executable WAR; `scripts/verify-war.py` verified its Spring Boot launcher, `/NeighborNet/` base path, referenced scripts/styles and home-page image. The packaged production profile retains the loopback listener on 8088, required password binding and `ddl-auto=none`. Existing bundle-size/CSS and Gradle deprecation warnings remain. Legacy MySQL-dependent JPA tests were excluded intentionally. Production MySQL and Maps were not contacted.

## Configure a reusable NeighborNet environment

1. Select `Justdenton/FinalProjectJD` and branch `fix/neighbornet-resume-readiness`. Keep the existing commit history. Include Git, a full Java 21 JDK with `javac`, Node 22/npm, Python 3 and Chrome/Chromium. Set `JAVA_HOME` to the JDK. Use the checked-in Gradle wrapper. Give npm and Gradle writable caches, for example `NPM_CONFIG_CACHE=/workspace/.npm-cache` and `GRADLE_USER_HOME=/workspace/.gradle-neighbornet`.
2. Retain the working GitHub connector. To use shell Git writes, reconnect repository-scoped GitHub authentication through the environment's credential configuration; replace the invalid binding there, never by pasting a token into chat or committing it. Limit fine-grained access to this repository: Contents read/write and Pull requests read/write. Updating `.github/workflows/` also needs Workflows write permission. Connector workflow writes may need a corresponding app permission or reauthorization. Actions should run with read-only `contents` permission and no AWS or production secrets.
3. Configure network access through the environment settings. For a restricted policy, allow GitHub and its archive/release hosts, `registry.npmjs.org`, `nodejs.org`, Gradle's distribution/redirect hosts and Maven Central/plugin-resolution hosts. Keep inherited proxy and CA configuration; give JVM tools the proxy settings explicitly. For host access, grant only the chosen management path and exact destinations. This session has no raw TCP or VPN access grant.
4. Connect AWS Core to the intended account using its supported sign-in/configuration flow, then require a successful `sts:GetCallerIdentity` result. If using a cloud outbound identity instead, bind a short-lived, assumed role in environment configuration and select its provided alias/manifest; install AWS CLI v2 if CLI use is needed. Do not add long-lived AWS keys to the repository or chat.
5. Start with inventory permissions: `ec2:DescribeRegions`, `ec2:DescribeInstances`, `ec2:DescribeInstanceStatus`, `ec2:DescribeSecurityGroups`, `ec2:DescribeAddresses`, `ec2:DescribeVolumes`, and `ssm:DescribeInstanceInformation`. If Route 53 owns the domain, add `route53:ListHostedZones` and `route53:ListResourceRecordSets`. Restrict regions/account and resources wherever the API supports it. Do not grant infrastructure mutation permissions for diagnostics. Verify the identity before interpreting an empty resource list.
6. Establish a separate, authorized host-management path. Prefer an existing Systems Manager registration and an audited, instance-scoped Session Manager role; CLI sessions also require the Session Manager plugin. If registration is missing, the owner must first review the proposed SSM agent, instance-profile and outbound connectivity changes. The instance profile commonly uses `AmazonSSMManagedInstanceCore`; it is separate from the operator's session permissions. No inbound application port is needed for SSM.
7. If SSM is unavailable, the owner can configure an existing SSH identity as a protected environment secret file, grant narrowly scoped network access to the target's SSH endpoint, and supply a verified host-key fingerprint through a trusted channel. Keep strict host-key checking enabled. Do not request or paste a private key or password in chat, broaden SSH ingress to the public Internet, or use EC2 API access as evidence of shell access.
8. Keep database credentials in a protected service environment or secret store outside Git. Google Maps key-owner access is separate: verify browser referrer/API restrictions, billing and enabled Maps/geocoding APIs without sharing credentials in chat.

## Gate before any production changes

No host, application, database, service, DNS or firewall configuration was changed in this session. No production backup has been taken because shell and database access are not established.

Once access works, inspect both candidate hosts before choosing a target:

- Identify account, region, instance IDs, public/private addresses, volumes, security groups and SSM registration. Match the domain's DNS address to the inventory.
- Inventory running services, listening ports, Apache virtual hosts/proxy routes, TLS certificates, Java/Tomcat versions, service users, application directories, database locations and scheduled jobs. Record Expense Tracker, Fraud Indicator, SpringFit and every other hosted application's dependencies and entry-page checks. Do not print secret environment files or unfiltered configuration/logs into chat.
- Measure available memory, JVM limits, swap, disk capacity and recent OOM/service errors. Historical OOM is a reason to investigate capacity, not authorization to restart or resize.
- Inspect `neighbornetdb` metadata and migration expectations without loading the repository's seed SQL. Keep personal database rows out of diagnostic output.

Before editing or deploying, create timestamped, access-restricted backups of the existing WARs/application directories, Apache/Tomcat/systemd configuration, service environment files, TLS configuration and relevant database configuration. Keep encrypted backups outside the public web root and outside Git; preserve ownership, permissions and checksums. For MySQL, take a protected logical backup including schema, data, routines, events and triggers using a restricted backup account and a protected option file or secret store. Review storage engines and consistency requirements; `--single-transaction` alone does not protect nontransactional tables or concurrent DDL. Verify a restore into an isolated database and record artifact/configuration rollback steps. EBS snapshots can supplement, but do not replace, verified application/database backups.

Present the deployment proposal after that inventory: affected files/services, available memory, rollback artifacts, HTTPS certificate/proxy route and impact on all hosted apps. Explain any required restart, resize, service reload or management setup before executing it. Keep NeighborNet's production listener on loopback and proxy it over HTTPS; do not open 8080/8088 publicly. Do not reset MySQL or execute `DB/neighbornetdb.sql` against production.

Keep PR #1 draft until HTTPS and disposable-account checks cover MySQL-backed registration/login/logout, public feed, report/comment operations, ownership isolation and live maps. Change the portfolio link only after the HTTPS demo address works and the other hosted applications still pass their checks.
