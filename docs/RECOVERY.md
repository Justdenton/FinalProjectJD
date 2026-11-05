# NeighborNet recovery

These repairs do not restore the public deployment by themselves.

## Build and test

Requirements: a full Java 21 JDK (including `javac`), Node.js 22 with npm, Python 3, and Chrome for frontend tests. Node 24 is not in Angular 18's supported Node range. Set `JAVA_HOME` to the JDK and `CHROME_BIN` if Chrome is not on the default path.

```sh
cd ngNeighborNet
npm ci
npm run test:smoke
cd ../NeighborNet
bash gradlew :test :bootWar
cd ..
python3 scripts/verify-war.py
```

The `NeighborNet recovery checks` GitHub Actions workflow runs the same focused frontend tests, isolated backend tests, WAR build and packaged-asset check on pull requests. It has read-only repository permission and no deployment credentials. A green run does not verify production MySQL, HTTPS or Google Maps.

For the current access diagnosis and secure environment setup, see [Access and hosting handoff](ACCESS.md).

The root application tests use an isolated H2 database. The legacy NeighborNetJPA entity tests still expect their original seeded MySQL database and are not included in `:test`. Production MySQL and Google Maps have not been verified by these tests.

The executable package is `NeighborNet/build/libs/NeighborNet.war`. Gradle builds and packages the current Angular sources, including public images, instead of using old committed bundles. Production frontend paths use `/NeighborNet/`; the development server keeps its root path.

## Deployment prerequisites

1. Obtain administrative shell access to the existing host. Inspect the current Apache, Java, MySQL and service configurations before changing anything. Back up configuration, application artifacts and the existing database.
2. Verify memory and disk capacity. Historical host logs showed an out-of-memory termination of Tomcat; restarting alone does not resolve capacity limits.
3. Verify the existing `neighbornetdb` schema and data. Do not run `DB/neighbornetdb.sql` against an existing database without reviewing its destructive statements and taking a backup.
4. Supply `NEIGHBORNET_DB_PASSWORD` through a protected service environment, with optional `NEIGHBORNET_DB_USER` and `NEIGHBORNET_DB_URL`. The production profile does not use the source repository's development password. Audit/rotate historical credentials before public deployment.
5. Run the executable WAR with `--spring.profiles.active=production`. It binds to loopback port 8088 at `/NeighborNet` for an HTTPS reverse proxy. Set measured JVM memory limits appropriate to the host; preserve the other hosted applications.
6. Restore valid HTTPS and configure Apache to proxy `/NeighborNet/` to `http://127.0.0.1:8088/NeighborNet/`. Verify configuration before reloading. Do not expose the application port publicly just to make an old link work.
7. Confirm Google Maps key restrictions, enabled APIs and billing with the key owner. The existing browser key remains unchanged; map rendering/geocoding needs separate live verification.
8. Review dependency advisories and framework support before public launch. This patch fixes installation without performing a major framework upgrade.
9. Test HTTPS, landing page, registration/login/logout, public feed, report creation/edit/disable, comments, ownership isolation and maps. Use disposable demo data, never personal passwords over HTTP. Update the portfolio link only after the new address works.

## Scope

Fixed: dependency resolution, production base path and default route, registration field collisions/error handling, duplicate report updates, invalid anonymous authorization headers, password logging/serialization, and ownership checks on report/comment disable operations.

Authentication still uses the original Basic authentication/localStorage design. This is a recovery patch, not a complete security audit or a claim of production readiness.
