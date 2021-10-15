import { useSelector } from "react-redux";

import { AppLink } from "@zesty-io/core/AppLink";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./ListReleases.less";
export function ListReleases() {
  const releases = useSelector((state) => state.releases.data);
  return (
    <main className={styles.ListReleases}>
      <Card className={styles.Card}>
        <CardHeader>New Release</CardHeader>
        <CardContent>Setup a new release</CardContent>
        <CardFooter>
          <AppLink to={`/release/create`}>Create Release</AppLink>
        </CardFooter>
      </Card>

      {releases.map((release) => {
        return (
          <Card key={release.ZUID} className={styles.Card}>
            <CardHeader>{release.name}</CardHeader>
            <CardContent>{release.description}</CardContent>
            <CardFooter>
              <AppLink to={`/release/${release.ZUID}`}>View Release</AppLink>
            </CardFooter>
          </Card>
        );
      })}
    </main>
  );
}
