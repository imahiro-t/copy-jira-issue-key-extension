chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "get_sprint") {
    const email = request.email;
    const apiToken = request.apiToken;
    const host = request.host;
    const projectKey = request.projectKey;

    getIssues(email, apiToken, host, projectKey).then((issues) => {
      const sortedIssues = issues.sort((a, b) => {
        const x = Number(a.fields?.parent?.id ?? Number.MAX_SAFE_INTEGER);
        const y = Number(b.fields?.parent?.id ?? Number.MAX_SAFE_INTEGER);
        return x - y;
      });
      const sprint = getSprint(sortedIssues);
      sendResponse({
        result: JSON.stringify({
          sprint: sprint,
        }),
      });
    });
  } else if (request.type === "get_info_to_create") {
    const email = request.email;
    const apiToken = request.apiToken;
    const host = request.host;
    const projectKey = request.projectKey;
    const templateId = request.templateId;

    getIssues(email, apiToken, host, projectKey).then((issues) => {
      const sortedIssues = issues.sort((a, b) => {
        const x = Number(a.fields?.parent?.id ?? Number.MAX_SAFE_INTEGER);
        const y = Number(b.fields?.parent?.id ?? Number.MAX_SAFE_INTEGER);
        return x - y;
      });
      const sprint = getSprint(sortedIssues);
      if (sprint) {
        getTemplate(email, apiToken, host, templateId).then((template) => {
          sendResponse({
            result: JSON.stringify({
              issues: sortedIssues,
              sprint: sprint,
              template: template,
            }),
          });
        });
      }
    });
  } else if (request.type === "create_sprint_page") {
    const email = request.email;
    const apiToken = request.apiToken;
    const host = request.host;
    const spaceKey = request.spaceKey;
    const parentId = request.parentId;
    const title = request.title;
    const content = request.content;
    const space = getSpace(email, apiToken, host, spaceKey).then((space) => {
      const body = {
        title: title,
        type: "page",
        parentId: parentId,
        spaceId: space.id,
        body: {
          storage: {
            value: content,
            representation: "storage",
          },
        },
      };
      createPage(email, apiToken, host, body).then((response) => {
        sendResponse(response);
      });
    });
  }
  return true;
});

const SEARCH_ISSUES_MAX_RESULTS = 100;

const authorizationHeaderValue = (email, apiToken) => {
  return "Basic " + btoa(`${email}:${apiToken}`);
};

const getIssues = async (email, apiToken, host, projectKey) => {
  const jql = `project = "${projectKey}" and sprint in openSprints()`;
  const body = {
    fields: ["*all"],
    fieldsByKeys: false,
    jql: jql,
    maxResults: SEARCH_ISSUES_MAX_RESULTS,
    startAt: 0,
  };
  return await searchIssuesRecursive(email, apiToken, host, body, 0, []);
};

const searchIssuesRecursive = async (
  email,
  apiToken,
  host,
  body,
  startAt,
  acc
) => {
  body.startAt = startAt;
  const response = await fetch(`https://${host}/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorizationHeaderValue(email, apiToken),
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (json.startAt + json.maxResults < json.total) {
    return searchIssuesRecursive(
      email,
      apiToken,
      host,
      body,
      startAt + SEARCH_ISSUES_MAX_RESULTS,
      acc.concat(json.issues ?? [])
    );
  } else {
    return acc.concat(json.issues ?? []);
  }
};

const getSprint = (issues) => {
  if (!issues) return null;
  let ret = null;
  issues.forEach((issue) => {
    Object.keys(issue.fields).forEach((key) => {
      const field = issue.fields[key];
      if (Array.isArray(field)) {
        field.forEach((x) => {
          if (
            x.state === "active" &&
            x.hasOwnProperty("name") &&
            x.hasOwnProperty("goal")
          ) {
            ret = {
              name: x.name,
              goal: x.goal,
              startDate: x.startDate,
              endDate: x.endDate,
            };
          }
        });
      }
    });
  });
  return ret;
};

const getTemplate = async (email, apiToken, host, templateId) => {
  const response = await fetch(
    `https://${host}/wiki/api/v2/pages/${templateId}?body-format=storage`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorizationHeaderValue(email, apiToken),
      },
    }
  );
  if (response.status === 200) {
    const json = await response.json();
    return {
      title: json.title,
      body: json.body?.storage?.value,
    };
  } else {
    return null;
  }
};

const getSpace = async (email, apiToken, host, spaceKey) => {
  const response = await fetch(
    `https://${host}/wiki/api/v2/spaces?keys=${spaceKey}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorizationHeaderValue(email, apiToken),
      },
    }
  );
  if (response.status === 200) {
    const json = await response.json();
    if (json.results.length > 0) {
      return {
        id: json.results[0].id,
        name: json.results[0].name,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const createPage = async (email, apiToken, host, body) => {
  const response = await fetch(`https://${host}/wiki/api/v2/pages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorizationHeaderValue(email, apiToken),
    },
    body: JSON.stringify(body),
  });
  if (response.status === 200) {
    const json = await response.json();
    const pageId = json.id;
    try {
      const propertyResponse = await fetch(
        `https://${host}/wiki/api/v2/pages/${pageId}/properties`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorizationHeaderValue(email, apiToken),
          },
        }
      );
      const propertyId = (await propertyResponse.json()).results?.find(
        (property) => property.key === "editor"
      )?.id;
      const body = {
        key: "editor",
        value: "v2",
      };
      if (propertyId) {
        await fetch(
          `https://${host}/wiki/api/v2/pages/${pageId}/properties/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: authorizationHeaderValue(email, apiToken),
            },
          }
        );
      }
      await fetch(`https://${host}/wiki/api/v2/pages/${pageId}/properties`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authorizationHeaderValue(email, apiToken),
        },
        body: JSON.stringify(body),
      });
    } catch (e) {}
    return {
      status: "success",
    };
  } else if (response.status === 400) {
    return {
      status: "error",
      message: (await response.json())?.errors[0]?.title,
    };
  } else {
    return {
      status: "error",
    };
  }
};
