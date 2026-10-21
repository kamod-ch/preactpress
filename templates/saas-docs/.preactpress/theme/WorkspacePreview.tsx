import type { FunctionalComponent } from "preact";

const WorkspacePreview: FunctionalComponent = () => (
  <div class="sd-workspace" aria-hidden="true">
    <div class="sd-workspace-topbar">
      <span />
      <span />
      <span />
      Acme workspace
    </div>
    <div class="sd-workspace-body">
      <div class="sd-workspace-nav">
        <strong>Engineering</strong>
        <p>Overview</p>
        <p>Members</p>
        <p>Integrations</p>
        <p>Billing</p>
      </div>
      <div class="sd-workspace-main">
        <h2>Finish setup</h2>
        <ol>
          <li>
            <span class="sd-workspace-check">✓</span>
            Create workspace
          </li>
          <li>
            <span class="sd-workspace-check">✓</span>
            Invite teammates
          </li>
          <li>
            <span class="sd-workspace-check">3</span>
            Connect Slack
          </li>
        </ol>
      </div>
    </div>
  </div>
);

export default WorkspacePreview;
