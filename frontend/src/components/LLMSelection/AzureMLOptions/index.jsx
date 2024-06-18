export default function AzureMLOptions({ settings }) {
    return (
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full flex items-center gap-4">
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-4">
              Azure Service Endpoint
            </label>
            <input
              type="url"
              name="AzureMLEndpoint"
              className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-full p-2.5"
              placeholder="https://my-azure.openai.azure.com"
              defaultValue={settings?.AzureMLEndpoint}
              required={true}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
  
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-4">
              API Key
            </label>
            <input
              type="password"
              name="AzureMLKey"
              className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-full p-2.5"
              placeholder="Azure API Key"
              defaultValue={settings?.AzureMLKey ? "*".repeat(20) : ""}
              required={true}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
  
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-4">
              Chat Deployment Name
            </label>
            <input
              type="text"
              name="AzureMLDeployment"
              className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-full p-2.5"
              placeholder="Azure deployment name"
              defaultValue={settings?.AzureMLDeployment}
              required={true}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="w-full flex items-center gap-4">
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-4">
              Chat Model Token Limit
            </label>
            <select
              name="AzureMLTokenLimit"
              defaultValue={settings?.AzureMLTokenLimit || 4096}
              className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-full p-2.5"
              required={true}
            >
              <option value={4096}>4,096</option>
              <option value={16384}>16,384</option>
              <option value={8192}>8,192</option>
              <option value={32768}>32,768</option>
              <option value={128000}>128,000</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
  