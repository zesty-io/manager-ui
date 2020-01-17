import React, { Component } from "react";
import { connect } from "react-redux";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./Dashboard.less";
export default connect(state => state)(
  class Dashboard extends Component {
    render() {
      return (
        <section className={styles.Dashboard}>
          Content Schema
          {/* <Card className={styles.Card}>
            <CardHeader>Single Page Schemas</CardHeader>
            <CardContent>
              <p>
                Single page schemas can be used to generate individual pages
                based on the same schema and template.
              </p>
              <p>
                These pages differ from Page Group Schemas by allowing each page
                generated from the schema to be parented seperately.
              </p>
              <p>Examples: "/about", "/contact", "/products"</p>
            </CardContent>
            <CardFooter>
              <Button>
                <Url href="/schema/new">Create Single Page Schema</Url>
              </Button>
            </CardFooter>
          </Card>
          <Card className={styles.Card}>
            <CardHeader>Page Group Schemas</CardHeader>
            <CardContent>
              <p>
                Page group schemas can be used to generate a pages in a group
                based on the same schema and template.
              </p>
              <p>
                These pages differ from Single Page Schemas in that all the
                pages are grouped and managed together.
              </p>
              <p>
                Examples: "/blog/article-1", "/blog/article-2",
                "/blog/article-3"
              </p>
            </CardContent>
            <CardFooter>
              <Button>
                <Url href="/schema/new">Create Page Group Schema</Url>
              </Button>
            </CardFooter>
          </Card>
          <Card className={styles.Card}>
            <CardHeader>Headless Data Schemas</CardHeader>
            <CardContent>
              <p>
                Headeless Data Schemas are used to create a group of
                non-routeable items that do not have templates.
              </p>
              <p>
                These differ from Single Page and Page Group Schemas by being
                non-routeable or viewable data.
              </p>
              <p>
                Use a Headless Data Schema to create groups of loose data which
                can be related to via other Schemas, rendered into other
                templates or accessed programmatically with your instance APIs.
              </p>
            </CardContent>
            <CardFooter>
              <Button>
                <Url href="/schema/new">Create Headless Data Schema</Url>
              </Button>
            </CardFooter>
          </Card> */}
        </section>
      );
    }
  }
);
