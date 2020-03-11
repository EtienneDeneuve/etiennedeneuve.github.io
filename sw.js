/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("workbox-v4.3.1/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "workbox-v4.3.1"});

workbox.core.setCacheNameDetails({prefix: "eleventy-plugin-pwa"});

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "2015/12/16/get-nexttrain/index.html",
    "revision": "127e641bbaa80d006c83577d4323070c"
  },
  {
    "url": "2016/01/15/get-ink-level-from-hp-printers-in-powershell/index.html",
    "revision": "398b11de04e27a65e930bda2fe919e15"
  },
  {
    "url": "2017/01/26/visual-studio-code-pour-ansible-terraform/index.html",
    "revision": "c65c0f2e4d70eb1e9a0ab8626e952956"
  },
  {
    "url": "2017/02/02/installation-de-nginx-en-reverse-proxy-avec-reecriture-du-html/index.html",
    "revision": "963be02a5b1bcf3c3c408766abec7272"
  },
  {
    "url": "2017/03/14/azure-et-le-backup-dun-mac/index.html",
    "revision": "0953751d469a56db60a5429f94fe891a"
  },
  {
    "url": "2017/04/25/azure-networking-tp-part-1/index.html",
    "revision": "a365cf54f758c2f3fab6196fc450a798"
  },
  {
    "url": "2017/09/24/project-honolulu-public-preview-mon-retour/index.html",
    "revision": "f6a19d65001e0ecef6873a2a88631231"
  },
  {
    "url": "2017/09/25/azure-cloud-shell-pleins-de-nouveautes-et-du-gros/index.html",
    "revision": "3ec94b9872f665206483ba08e0ee0977"
  },
  {
    "url": "2017/09/26/azurepscmdnotfound/index.html",
    "revision": "563528f9efc049211cea6cf227cb53d9"
  },
  {
    "url": "2017/09/27/azure-powershell-nettoyer-les-tags/index.html",
    "revision": "48cf6170cc18ea566ca5dc733addc3bd"
  },
  {
    "url": "2017/09/27/frpsug-powershell-saturday-et-contenu-de-la-session-de-lutile-ou-pas/index.html",
    "revision": "18e47e8f62b489d035a656db8e5a5714"
  },
  {
    "url": "2017/10/09/azure-devops/index.html",
    "revision": "1fab4e6b71239dfa362b64d60bd080ce"
  },
  {
    "url": "2017/10/09/vsts-for-ops-1/index.html",
    "revision": "c843f53cb9ba0928cb6a1ba716540977"
  },
  {
    "url": "2018/03/28/os-factory-azure-et-aws/index.html",
    "revision": "6a0a5a10211a36db8753a451d0839ffc"
  },
  {
    "url": "2018/04/06/terraform-providers-datasource/index.html",
    "revision": "888a5af2e7f2264053a1ad2f103e2f29"
  },
  {
    "url": "2018/06/23/git-pour-ops-par-un-ops/index.html",
    "revision": "954f3e67f3ae56b36fad31c226ffd36a"
  },
  {
    "url": "2018/06/26/documentation-as-code/index.html",
    "revision": "29521cb0dea9f55432fb1518b39e5930"
  },
  {
    "url": "2018/06/26/setup-vs-code-bash-git/index.html",
    "revision": "23647630b11142a53fe80c7b38e83d37"
  },
  {
    "url": "2018/07/02/az-cli-20-tricks/index.html",
    "revision": "1b638a95a2bb84510e42c52c66c530ce"
  },
  {
    "url": "2018/07/02/how-to-manage-dns-terraform/index.html",
    "revision": "c488eff502f89780dff16c5705c4e1a6"
  },
  {
    "url": "2018/12/05/adsk-in-a-breeze/index.html",
    "revision": "1b6743e7133326dd8ad9d955f6c69975"
  },
  {
    "url": "2020/02/07/infra-testing-easy-path/index.html",
    "revision": "a461deaea3d1c6545d38b8b309a97332"
  },
  {
    "url": "2020/02/25/terraform-azurerm-2/index.html",
    "revision": "9747f7b6360ceb0eda3126c0b93ac4d9"
  },
  {
    "url": "2020/03/05/teams-linux-webcam-error/index.html",
    "revision": "85cccc19fa5ae0066aefa4b07925602d"
  },
  {
    "url": "404.html",
    "revision": "2e5c71ef7765052f4c5a9548111f2b86"
  },
  {
    "url": "about/index.html",
    "revision": "cbb6c84fc2080a1b0b8524e33d34b9e8"
  },
  {
    "url": "css/style.css",
    "revision": "1214b7863d81d2fbf8618c3e8cbee192"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011-100x100.jpg",
    "revision": "f7369d206c13c56a33c8c94e30ba8180"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011-1024x541.jpg",
    "revision": "92b5ec6032d16dc26e705c4c8e362712"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011-150x150.jpg",
    "revision": "b895682bdbbcefa613db5738c258c3db"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011-300x158.jpg",
    "revision": "bc415f48598f748a9927b826989e06be"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011-768x406.jpg",
    "revision": "9936ce33138cf162247822703dbc54fd"
  },
  {
    "url": "images/2015/12/SNCF_Logo2011.jpg",
    "revision": "5c3ad95756f792886504755f4cf92d8e"
  },
  {
    "url": "images/2017/01/nginx-100x72.png",
    "revision": "e428a01dcd27c88bdf794cd78aeb36e0"
  },
  {
    "url": "images/2017/01/nginx-150x72.png",
    "revision": "49ff9dfe7ff2c765d599c032772405bc"
  },
  {
    "url": "images/2017/01/nginx-300x61.png",
    "revision": "4d88eaef8bd958b2a21fcdcee0557af0"
  },
  {
    "url": "images/2017/01/nginx.png",
    "revision": "efabf1246bebb5783d2350492262312d"
  },
  {
    "url": "images/2017/09/20521787-150x150.png",
    "revision": "661c2088ec949275f4a7f5c28f575848"
  },
  {
    "url": "images/2017/09/20521787.png",
    "revision": "226c8c39d9f0272aa45ffc35f1491d36"
  },
  {
    "url": "images/2017/09/azure-1-copy-700x700-150x150.png",
    "revision": "c3721d6dba3e73d12b0532f88789650f"
  },
  {
    "url": "images/2017/09/azure-1-copy-700x700-300x300.png",
    "revision": "ad91a69aee4714e471a2e97e6e5708a9"
  },
  {
    "url": "images/2017/09/azure-1-copy-700x700-640x360.png",
    "revision": "b1b32a6baf442323c06586a8c24a40b5"
  },
  {
    "url": "images/2017/09/azure-1-copy-700x700.png",
    "revision": "073734454233bca7641a2637dca12430"
  },
  {
    "url": "images/2017/09/Balais-150x150.jpg",
    "revision": "e0103667f554801b2f47de93494fd077"
  },
  {
    "url": "images/2017/09/Balais-300x200.jpg",
    "revision": "291fa5dd9e5b13deed708b1d58067d62"
  },
  {
    "url": "images/2017/09/Balais-640x360.jpg",
    "revision": "1e17ac342fb2fd8868edfc046c174ae1"
  },
  {
    "url": "images/2017/09/Balais.jpg",
    "revision": "8fbad9ade1f7094d04788e3b94972b14"
  },
  {
    "url": "images/2017/09/CellInsights-8-e1506426355531-150x150.jpg",
    "revision": "266d23aaaff85c349f252a3a39747b48"
  },
  {
    "url": "images/2017/09/CellInsights-8-e1506426355531-218x300.jpg",
    "revision": "d37496322b56e71edb8d530c26475d61"
  },
  {
    "url": "images/2017/09/CellInsights-8-e1506426355531-436x360.jpg",
    "revision": "8f26897c00f57d6d7d23a009af4dc84c"
  },
  {
    "url": "images/2017/09/CellInsights-8-e1506426355531.jpg",
    "revision": "1ed28dde69e2d75784ad68331662f25c"
  },
  {
    "url": "images/2017/09/Cloud-Shell-1024x572.png",
    "revision": "b11e60a2efa2281e2aae533adc3a77db"
  },
  {
    "url": "images/2017/09/Cloud-Shell-150x150.png",
    "revision": "1fa662bfe19dfe948bdac75979e13bb7"
  },
  {
    "url": "images/2017/09/Cloud-Shell-300x167.png",
    "revision": "08bde58a289453ffd595524734270a3d"
  },
  {
    "url": "images/2017/09/Cloud-Shell-640x360.png",
    "revision": "1b273b1280109a8dd9b6f6b03ab96e43"
  },
  {
    "url": "images/2017/09/Cloud-Shell-768x429.png",
    "revision": "d21f876dca2cf7c8a1dbc081cbc3b1b6"
  },
  {
    "url": "images/2017/09/Cloud-Shell.png",
    "revision": "0af71ade44cebcbb4c10da3717b22c83"
  },
  {
    "url": "images/2017/09/cloudshell-containers-1024x119.png",
    "revision": "9fd6b11bc78345eec132422da90ef514"
  },
  {
    "url": "images/2017/09/cloudshell-containers-150x150.png",
    "revision": "7a110117643278cec549d48223e6379a"
  },
  {
    "url": "images/2017/09/cloudshell-containers-300x35.png",
    "revision": "bd49ade878f7e4713811fb9c6f856e70"
  },
  {
    "url": "images/2017/09/cloudshell-containers-640x193.png",
    "revision": "3e7590477ee5f8b0ef406faf40586b2f"
  },
  {
    "url": "images/2017/09/cloudshell-containers-768x89.png",
    "revision": "fedbaff71c9cf5244fc71d05b97f3dcd"
  },
  {
    "url": "images/2017/09/cloudshell-containers.png",
    "revision": "6b662ceee014c83c36421d8e6fd64b25"
  },
  {
    "url": "images/2017/09/cloudshell-ps-150x103.png",
    "revision": "3c54be2ff2ac6541e2979388dad3ef9f"
  },
  {
    "url": "images/2017/09/cloudshell-ps-300x45.png",
    "revision": "6353e307fe9a314aa721dfaf1adec864"
  },
  {
    "url": "images/2017/09/cloudshell-ps-640x103.png",
    "revision": "980a36e2323b3d43dcdf541d31342b01"
  },
  {
    "url": "images/2017/09/cloudshell-ps.png",
    "revision": "c471e015099c5f9fb91f634d9227076a"
  },
  {
    "url": "images/2017/09/cropped-header-1-1024x128.png",
    "revision": "565280f680dd29725bc5bb7cfcb24abd"
  },
  {
    "url": "images/2017/09/cropped-header-1-150x150.png",
    "revision": "06781a50a2fbe6d0dbfe1d9259df3ad9"
  },
  {
    "url": "images/2017/09/cropped-header-1-300x38.png",
    "revision": "54ffeef0e20bcfc001b78afd16008746"
  },
  {
    "url": "images/2017/09/cropped-header-1-640x182.png",
    "revision": "fe99921c3051a325e15bfe88f6440f7a"
  },
  {
    "url": "images/2017/09/cropped-header-1-768x96.png",
    "revision": "d70cb239da8fdb0650b88faf1a5f8fd0"
  },
  {
    "url": "images/2017/09/cropped-header-1.png",
    "revision": "2e37d14604f7eaa33ba7a577a4869fbc"
  },
  {
    "url": "images/2017/09/cropped-header-150x150.png",
    "revision": "c47faefd4af17ab0a6823e015818fef9"
  },
  {
    "url": "images/2017/09/cropped-header-180x180.png",
    "revision": "968cd910d962d9a11da3962355f933d8"
  },
  {
    "url": "images/2017/09/cropped-header-192x192.png",
    "revision": "94fd51f44c548d63403d5bdc214affd0"
  },
  {
    "url": "images/2017/09/cropped-header-270x270.png",
    "revision": "c9f2a5aa424df4efbdc0d1275f86231f"
  },
  {
    "url": "images/2017/09/cropped-header-300x300.png",
    "revision": "f7550422844de01bfa7180bda49e146d"
  },
  {
    "url": "images/2017/09/cropped-header-32x32.png",
    "revision": "c345c15192dc5423793b4a950c30bd60"
  },
  {
    "url": "images/2017/09/cropped-header-512x360.png",
    "revision": "22e303facf44301a09a2b98525905199"
  },
  {
    "url": "images/2017/09/cropped-header.png",
    "revision": "fda5197cd03df521211ed04ee245ce4d"
  },
  {
    "url": "images/2017/09/Docker_logo-150x150.png",
    "revision": "fb470cf56d9b54bb1cc5259bf1c3876d"
  },
  {
    "url": "images/2017/09/Docker_logo-300x72.png",
    "revision": "5e5a194fe0f59eb926d442ae01ab9ae9"
  },
  {
    "url": "images/2017/09/Docker_logo-640x163.png",
    "revision": "062d600d1e1388e833d8b379a436f7ad"
  },
  {
    "url": "images/2017/09/Docker_logo.png",
    "revision": "e50a6ad800ec662488ac88de6c272368"
  },
  {
    "url": "images/2017/09/download-150x150.png",
    "revision": "2c62012ffeb4139b6f6c06e40acf2835"
  },
  {
    "url": "images/2017/09/download.png",
    "revision": "e310271cc429e33efcd08d7b2b26e9c8"
  },
  {
    "url": "images/2017/09/get-cazurevmos-1-gvm-150x104.png",
    "revision": "e9c4165aa69c1e94b93575d00ca5b11b"
  },
  {
    "url": "images/2017/09/get-cazurevmos-1-gvm-300x42.png",
    "revision": "fc38c37a4725e09e2a8b47cd8b679062"
  },
  {
    "url": "images/2017/09/get-cazurevmos-1-gvm-640x104.png",
    "revision": "231dae9929d3b0a4dbdc4dadc0d197a3"
  },
  {
    "url": "images/2017/09/get-cazurevmos-1-gvm.png",
    "revision": "9f7923d1ae2b5b26b446785a37012499"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi-1024x190.png",
    "revision": "b06d8aa0b57dd66a6aa60bd4e48b48af"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi-150x150.png",
    "revision": "f0b865c71ec8fc42f973587ed730ffba"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi-300x56.png",
    "revision": "7dcfe4ea36f52c496fad7840753c8faf"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi-640x196.png",
    "revision": "5d5b4874689dffd963904e6517f2c20c"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi-768x142.png",
    "revision": "6d88cba447ead19898e8934afb5ff6d6"
  },
  {
    "url": "images/2017/09/get-cazurevmos-10-youpi.png",
    "revision": "47fe0ecc7bb652bb9a988c0c96b4b2d5"
  },
  {
    "url": "images/2017/09/get-cazurevmos-2-so-150x84.png",
    "revision": "316634a5fba0aba922db107b49f1a60f"
  },
  {
    "url": "images/2017/09/get-cazurevmos-2-so-300x36.png",
    "revision": "cdd49163c7a77c1685f3f30f6057b1c5"
  },
  {
    "url": "images/2017/09/get-cazurevmos-2-so-640x84.png",
    "revision": "1b0cefc08de137d8fd0a8570d1cf0176"
  },
  {
    "url": "images/2017/09/get-cazurevmos-2-so.png",
    "revision": "1c4a6b443708a3bd3591ac36da9d6f92"
  },
  {
    "url": "images/2017/09/get-cazurevmos-3-help-150x150.png",
    "revision": "27ccd226131cdd7eefcf52435fd934c6"
  },
  {
    "url": "images/2017/09/get-cazurevmos-3-help-300x95.png",
    "revision": "e8e3a4cec318fac70aa882fa0bda16ae"
  },
  {
    "url": "images/2017/09/get-cazurevmos-3-help-640x310.png",
    "revision": "4e821b59794cdd845af4aa08e48aa718"
  },
  {
    "url": "images/2017/09/get-cazurevmos-3-help-768x244.png",
    "revision": "1e3a28818cdff3b872b03a34810a2b02"
  },
  {
    "url": "images/2017/09/get-cazurevmos-3-help.png",
    "revision": "d57a156546d1d979b399b2a396d31c70"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm-1024x419.png",
    "revision": "a0e16673dd68614bd49a3f7c8b11f26a"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm-150x150.png",
    "revision": "d8a92b92baa3cf7e61821f3a99a437b7"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm-300x123.png",
    "revision": "ad97e1a6c25824982307bac202fb7b0c"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm-640x360.png",
    "revision": "4c75df05d61e7a755201d99bd2f3fdd0"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm-768x314.png",
    "revision": "c0efe84abbc916ac7d30b56dd96616a9"
  },
  {
    "url": "images/2017/09/get-cazurevmos-4-gm.png",
    "revision": "936592b08eff7b07c734f7c4aa8fd9b1"
  },
  {
    "url": "images/2017/09/get-cazurevmos-5-osp-150x24.png",
    "revision": "7b4780fcde71b7f745a006ce57ac1c0e"
  },
  {
    "url": "images/2017/09/get-cazurevmos-5-osp-300x9.png",
    "revision": "54ef1e1fc6cc33341e4b306b11dda258"
  },
  {
    "url": "images/2017/09/get-cazurevmos-5-osp-640x24.png",
    "revision": "f4ad81bceef068c49df7b46bfd72cb52"
  },
  {
    "url": "images/2017/09/get-cazurevmos-5-osp-768x23.png",
    "revision": "aded5c7404f79f99de276489aa6377dd"
  },
  {
    "url": "images/2017/09/get-cazurevmos-5-osp.png",
    "revision": "1ccbf1fe3fcb46ab10d2057eef8e40b0"
  },
  {
    "url": "images/2017/09/get-cazurevmos-6-os-150x83.png",
    "revision": "3d0c64ca60eefdf1dbdb311f4c14be57"
  },
  {
    "url": "images/2017/09/get-cazurevmos-6-os-300x43.png",
    "revision": "d3c557ea054c7d192a07cf1a91d0069e"
  },
  {
    "url": "images/2017/09/get-cazurevmos-6-os.png",
    "revision": "2dcf8b905f252922614c2d67e10edf1c"
  },
  {
    "url": "images/2017/09/get-cazurevmos-7-exp-150x150.png",
    "revision": "3aa7d53a92b9674e2c81fb7466f04c33"
  },
  {
    "url": "images/2017/09/get-cazurevmos-7-exp-300x66.png",
    "revision": "775871d827e67470fca7d82722516676"
  },
  {
    "url": "images/2017/09/get-cazurevmos-7-exp-640x161.png",
    "revision": "ed7bd59a839a1577e7e85bf77cc8e337"
  },
  {
    "url": "images/2017/09/get-cazurevmos-7-exp.png",
    "revision": "7b4d6c222f214cc389a95b968a1e759b"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool-1024x427.png",
    "revision": "395f4cfdea726b6518153128d5d0b9cc"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool-150x150.png",
    "revision": "6b848d8d8e3fed1ebf0e2ed752f99758"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool-300x125.png",
    "revision": "32ac563174d2d86dd51cdf9506923c78"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool-640x360.png",
    "revision": "d2d992e645060763ab5ae73dc251051c"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool-768x320.png",
    "revision": "7faf825ec65c5f659982b149ac715259"
  },
  {
    "url": "images/2017/09/get-cazurevmos-8-Cool.png",
    "revision": "1e4571070c29686bb576addb3565094b"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi-1024x383.png",
    "revision": "70c3c0b6b3edb72302b16e9969b41b96"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi-150x150.png",
    "revision": "451c76f6a1f5c52fdb047555d01c4c01"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi-300x112.png",
    "revision": "3b5a033429404aef6ff0123943bc375e"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi-640x360.png",
    "revision": "1034d16567fdfdf53496c7408308d2b7"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi-768x287.png",
    "revision": "4d2aa01cf1cd920c08fe558bbeebbf67"
  },
  {
    "url": "images/2017/09/get-cazurevmos-9-youpi.png",
    "revision": "97991e1a12157d1e10b48017a9f2039a"
  },
  {
    "url": "images/2017/09/header-1024x130.png",
    "revision": "7d9980bfe464d0ea8dabbdc31228fbd6"
  },
  {
    "url": "images/2017/09/header-150x150.png",
    "revision": "3df3fd15316bf75c404938f5536d4893"
  },
  {
    "url": "images/2017/09/header-300x38.png",
    "revision": "aa52336fcf4b551b1430920d6713a7d4"
  },
  {
    "url": "images/2017/09/header-640x185.png",
    "revision": "32f577c9780d2aa178a332a5859a2434"
  },
  {
    "url": "images/2017/09/header-768x98.png",
    "revision": "cd6019fce0f6a5b5df482fa6e1c69884"
  },
  {
    "url": "images/2017/09/header.png",
    "revision": "02ac1d8c893d9dd48625ed27b81ac471"
  },
  {
    "url": "images/2017/09/Honolu-1024x552.png",
    "revision": "b102d8646a18f3e9e3e8660827d49beb"
  },
  {
    "url": "images/2017/09/Honolu-150x150.png",
    "revision": "0f1375cd22c3d213522386a94f9e5dca"
  },
  {
    "url": "images/2017/09/Honolu-300x162.png",
    "revision": "f9ae6ca2074832eb7aa87a6fb6efa202"
  },
  {
    "url": "images/2017/09/Honolu-400x280.png",
    "revision": "fa58d668ac3ae4117f2ca482151b9071"
  },
  {
    "url": "images/2017/09/Honolu-50x50.png",
    "revision": "dda5e0ad0d79542b7c0f5d754871b1de"
  },
  {
    "url": "images/2017/09/Honolu-680x330.png",
    "revision": "203f1ad5902739f7cf85c0534b0a1f03"
  },
  {
    "url": "images/2017/09/Honolu-768x414.png",
    "revision": "f76b6c33e05915f2e3807d8fc68ee9b3"
  },
  {
    "url": "images/2017/09/Honolu.png",
    "revision": "a5391418e84006e26bd3ca56d9549b88"
  },
  {
    "url": "images/2017/09/HyperV-1024x576.png",
    "revision": "aab5d65eec5d4c0e2cc574d5ccd9c84c"
  },
  {
    "url": "images/2017/09/HyperV-150x150.png",
    "revision": "25ebc5410318f8c290f2192ade12e87a"
  },
  {
    "url": "images/2017/09/HyperV-300x169.png",
    "revision": "0a0a8ef6a72a8488a9d06cfb9f0d9208"
  },
  {
    "url": "images/2017/09/HyperV-400x280.png",
    "revision": "88145417ec99b553002fd57990fa505a"
  },
  {
    "url": "images/2017/09/HyperV-50x50.png",
    "revision": "9426a725cad6d95f316b6a33d2230b29"
  },
  {
    "url": "images/2017/09/HyperV-680x330.png",
    "revision": "015881edc2591da9d376d90ac1aa22c5"
  },
  {
    "url": "images/2017/09/HyperV-768x432.png",
    "revision": "0b331449727d689a5de0d7af510398e6"
  },
  {
    "url": "images/2017/09/HyperV.png",
    "revision": "085d43ac5b736601ed1e156ce121ee2e"
  },
  {
    "url": "images/2017/09/vm-1024x165.png",
    "revision": "acdd358ca97e2fa5b7e4c8b369dfd754"
  },
  {
    "url": "images/2017/09/vm-150x150.png",
    "revision": "9eefb680b77d6e8c75a42957133386c1"
  },
  {
    "url": "images/2017/09/vm-300x48.png",
    "revision": "b8f89e8742886123690eb605961c9526"
  },
  {
    "url": "images/2017/09/vm-400x249.png",
    "revision": "c6eeda82136ede2348f474aff3cb231c"
  },
  {
    "url": "images/2017/09/vm-50x50.png",
    "revision": "38b0a309b4874179f6c8eda5b279bcb9"
  },
  {
    "url": "images/2017/09/vm-680x249.png",
    "revision": "382b91097b3a838d165b1a0c22eb7045"
  },
  {
    "url": "images/2017/09/vm-768x124.png",
    "revision": "fe682aaaa6c17aec526b7db606cdd9c7"
  },
  {
    "url": "images/2017/09/vm.png",
    "revision": "8fa8908f1646c78a1ed5c38abbff3e31"
  },
  {
    "url": "images/2017/10/addfolder-1-150x150.png",
    "revision": "3ff9b9e2c843a9f7e3803d3bcbe897a1"
  },
  {
    "url": "images/2017/10/addfolder-1-300x109.png",
    "revision": "3258cd6674adbe81fe0085aed4edc401"
  },
  {
    "url": "images/2017/10/addfolder-1.png",
    "revision": "ff415dc393c327582c3278439c845de9"
  },
  {
    "url": "images/2017/10/addfolder-150x150.png",
    "revision": "339a46a90e616414955c874a21c53556"
  },
  {
    "url": "images/2017/10/addfolder-300x109.png",
    "revision": "8a325edd285f5212c6f13f786b537327"
  },
  {
    "url": "images/2017/10/addfolder.png",
    "revision": "0c81bbe76e7d750ab41c9ef2c95e702b"
  },
  {
    "url": "images/2017/10/Capture-Agent-Pool-150x145.png",
    "revision": "e02330deeaaaa7c0c668d0b372dc714f"
  },
  {
    "url": "images/2017/10/Capture-Agent-Pool-300x77.png",
    "revision": "22206595813906d83572e2860dd0eac7"
  },
  {
    "url": "images/2017/10/Capture-Agent-Pool.png",
    "revision": "a7fd92c193b5fa6f5cc2201e55ec0ca0"
  },
  {
    "url": "images/2017/10/Etienne20Deneuve2-150x150.jpg",
    "revision": "6fd62eeeeae8ae8f87ad83241ec7b5ca"
  },
  {
    "url": "images/2017/10/Etienne20Deneuve2-225x300.jpg",
    "revision": "b74a38b3f71f48ffc20a44c1f9820a4e"
  },
  {
    "url": "images/2017/10/Etienne20Deneuve2-640x360.jpg",
    "revision": "322d9850d01c280cbf6be7905a51d776"
  },
  {
    "url": "images/2017/10/Etienne20Deneuve2-768x1024.jpg",
    "revision": "b67fd61eecc2012a338bea74e1b210c1"
  },
  {
    "url": "images/2017/10/Etienne20Deneuve2.jpg",
    "revision": "d946ea826a0b9f8c86045be01f0fe686"
  },
  {
    "url": "images/2017/10/Git-Clone-150x150.png",
    "revision": "f2c5a932bb24c9101431aa1ed3de679c"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1-1024x498.png",
    "revision": "4cb7811d944cb788553ea604611eb1f0"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1-150x150.png",
    "revision": "a45486ba3ce61412b040793b8b5de35e"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1-300x146.png",
    "revision": "e945f3874a88ac4d8b3c6e6c36ba7521"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1-640x360.png",
    "revision": "775cfc710bc8d3ebbbd69d0bc228ac76"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1-768x373.png",
    "revision": "d6036a41d4c3a359f6605a8d78c5614b"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1.png",
    "revision": "e6aa4406b18bd4e3e76a0aabe8a082cb"
  },
  {
    "url": "images/2017/10/Git-Clone-2-1024x498.png",
    "revision": "4a0d3bd3d53028c80fe1d23b1a8f17e2"
  },
  {
    "url": "images/2017/10/Git-Clone-2-150x150.png",
    "revision": "3f6ebcff0e61a23a1df3bfdf3391ea27"
  },
  {
    "url": "images/2017/10/Git-Clone-2-300x146.png",
    "revision": "5d564d70a1bd79c1895650d7414b96a9"
  },
  {
    "url": "images/2017/10/Git-Clone-2-640x360.png",
    "revision": "20b93b05cd739d01280f9def79b14de9"
  },
  {
    "url": "images/2017/10/Git-Clone-2-768x373.png",
    "revision": "69a39b5e64264729c3c041c58346d9cc"
  },
  {
    "url": "images/2017/10/Git-Clone-2.png",
    "revision": "f45c2e67f0fe159289cf942df8f3d6fd"
  },
  {
    "url": "images/2017/10/Git-Clone-3-150x150.png",
    "revision": "fbbfeb96018e3cfc0c3f4be9eba3eb24"
  },
  {
    "url": "images/2017/10/Git-Clone-3-300x58.png",
    "revision": "d25742b3f9f99345a88694372ca60ccb"
  },
  {
    "url": "images/2017/10/Git-Clone-3-640x161.png",
    "revision": "2218214f99bd6c236769ee144116979f"
  },
  {
    "url": "images/2017/10/Git-Clone-3-768x148.png",
    "revision": "3ac4b0819a228ccf9e9206a32c5548f1"
  },
  {
    "url": "images/2017/10/Git-Clone-3.png",
    "revision": "bf4628c5c122136da4e43e3196ff6101"
  },
  {
    "url": "images/2017/10/Git-Clone-300x217.png",
    "revision": "f8cd89212f44ba845b269117aaa0c61d"
  },
  {
    "url": "images/2017/10/Git-Clone-4-1024x45.png",
    "revision": "3eda09d5fe8d55c5b8914b4df7c805b2"
  },
  {
    "url": "images/2017/10/Git-Clone-4-150x52.png",
    "revision": "92f84d2282bc8fc8309c10678864314f"
  },
  {
    "url": "images/2017/10/Git-Clone-4-300x13.png",
    "revision": "3d42abe6587ee32a376aa732556703b0"
  },
  {
    "url": "images/2017/10/Git-Clone-4-640x52.png",
    "revision": "53d2bf7439e65c50f0014d3b46e1ef44"
  },
  {
    "url": "images/2017/10/Git-Clone-4-768x34.png",
    "revision": "a9ac4423083130998ad8227baa86c00c"
  },
  {
    "url": "images/2017/10/Git-Clone-4.png",
    "revision": "bdf816c774a32a531317bb7f12618192"
  },
  {
    "url": "images/2017/10/Git-Clone.png",
    "revision": "0bfefe1cb2b9ba64e7e02470717969ab"
  },
  {
    "url": "images/2017/10/Git-Commit-150x150.png",
    "revision": "63faa47d84c56ef188c2087b85e389f4"
  },
  {
    "url": "images/2017/10/Git-Commit-300x216.png",
    "revision": "b20bf87a70599428620622f8fe76cf3d"
  },
  {
    "url": "images/2017/10/Git-Commit-549x360.png",
    "revision": "ad0e9bfe2a49c60790dfd712e71e0a20"
  },
  {
    "url": "images/2017/10/Git-Commit.png",
    "revision": "2670050ad7d23d1b533ccbfe38808fb7"
  },
  {
    "url": "images/2017/10/Git-Logo-2Color-150x150.png",
    "revision": "5b9570188a4e2dc8c0276051509d2f15"
  },
  {
    "url": "images/2017/10/Git-Logo-2Color-300x125.png",
    "revision": "8092045a2ce9ff12ab0bec9d856908b9"
  },
  {
    "url": "images/2017/10/Git-Logo-2Color-640x360.png",
    "revision": "1242c6f47ba7b1fd70cace760c431b27"
  },
  {
    "url": "images/2017/10/Git-Logo-2Color-768x321.png",
    "revision": "7e4940fa80bbacc32cad7d9b4dcb71b3"
  },
  {
    "url": "images/2017/10/Git-Logo-2Color.png",
    "revision": "042664999475fd8cc3672db6567e2e53"
  },
  {
    "url": "images/2017/10/Git-Push-150x150.png",
    "revision": "b85348be8ca1f7b524f9941609d2165a"
  },
  {
    "url": "images/2017/10/Git-Push-300x155.png",
    "revision": "9b30731a85c86aa8b15a784930b71715"
  },
  {
    "url": "images/2017/10/Git-Push-640x360.png",
    "revision": "16e6e890ba74cc7f4c9a250e359910e8"
  },
  {
    "url": "images/2017/10/Git-Push-768x397.png",
    "revision": "4b54701e9868d8e0faa440aac430beaa"
  },
  {
    "url": "images/2017/10/Git-Push.png",
    "revision": "1e7d43dde9ea24be172878036be97632"
  },
  {
    "url": "images/2017/10/mirror-frame-2407289_960_720-150x150.png",
    "revision": "5421f79e6eb994b62c65c774c69797d7"
  },
  {
    "url": "images/2017/10/mirror-frame-2407289_960_720-195x300.png",
    "revision": "e46b143b63d04ce9a9ff2f7de1d527e9"
  },
  {
    "url": "images/2017/10/mirror-frame-2407289_960_720-468x360.png",
    "revision": "2eb437e02b64290068d84e562e1cb0ec"
  },
  {
    "url": "images/2017/10/mirror-frame-2407289_960_720.png",
    "revision": "e265fbebe67c5c5ebb4d0e78f2e841c0"
  },
  {
    "url": "images/2017/10/MVP-150x150.png",
    "revision": "6df1c9091cc3f0c8ae6fe8be59427277"
  },
  {
    "url": "images/2017/10/MVP-300x231.png",
    "revision": "9684f3763ba6a552c923b68f9064f16c"
  },
  {
    "url": "images/2017/10/MVP-640x360.png",
    "revision": "35d19d7a5973012f975165fe6caac74d"
  },
  {
    "url": "images/2017/10/MVP.png",
    "revision": "0d9b7dd1db2fc694a569c02bf8056ed6"
  },
  {
    "url": "images/2017/10/Packer-1024x467.png",
    "revision": "ab76f07c70e36b26dea3af830203e16a"
  },
  {
    "url": "images/2017/10/Packer-150x150.png",
    "revision": "0290b3a040c359090cfe7169d285d98f"
  },
  {
    "url": "images/2017/10/Packer-300x137.png",
    "revision": "edd10d0d50442dcae307facf1f88bc10"
  },
  {
    "url": "images/2017/10/Packer-640x360.png",
    "revision": "283f384009a1c7b1388319f5e7db3759"
  },
  {
    "url": "images/2017/10/Packer-768x350.png",
    "revision": "908d13622690b13c1652b21984c7844f"
  },
  {
    "url": "images/2017/10/Packer.png",
    "revision": "2ecad420ecbf12a0bd5fffdc769374ad"
  },
  {
    "url": "images/2017/10/project-creation-title-banner-1024x588.png",
    "revision": "ae31679689425a035377241e722a92f0"
  },
  {
    "url": "images/2017/10/project-creation-title-banner-150x150.png",
    "revision": "6d480b8d1675c1871de639df4e1250cd"
  },
  {
    "url": "images/2017/10/project-creation-title-banner-300x172.png",
    "revision": "00f4ae51e3d62137f4c2144223bd4a05"
  },
  {
    "url": "images/2017/10/project-creation-title-banner-640x360.png",
    "revision": "8cecc6446f2dfca1823b116ccf75460a"
  },
  {
    "url": "images/2017/10/project-creation-title-banner-768x441.png",
    "revision": "51de8c9bfd64b48b3dbe35c4dd41d7a8"
  },
  {
    "url": "images/2017/10/project-creation-title-banner.png",
    "revision": "264be797e513d3ecbf668b8acc217065"
  },
  {
    "url": "images/2017/10/Push-150x150.png",
    "revision": "0522f9dd0d57320e18e1e4f5c1254c85"
  },
  {
    "url": "images/2017/10/Push-167x300.png",
    "revision": "cd2b9625518ae5e234941387c5de7147"
  },
  {
    "url": "images/2017/10/Push-290x360.png",
    "revision": "d6996cfdde9ea86962db09fd7220cfa6"
  },
  {
    "url": "images/2017/10/Push.png",
    "revision": "167f56f3882a8523c5fdb90f49fc2c04"
  },
  {
    "url": "images/2017/10/Sans-titre-150x150.png",
    "revision": "ace99876ce9759b2da50f23b1e5fc66e"
  },
  {
    "url": "images/2017/10/Sans-titre-300x83.png",
    "revision": "b078a53563335cfc807eaf72c0190c84"
  },
  {
    "url": "images/2017/10/Sans-titre.png",
    "revision": "9923b824fa5ed13acc41824173603460"
  },
  {
    "url": "images/2017/10/storage-account-key-1024x515.png",
    "revision": "635d8684531214e3cc2ff0c6941a55d7"
  },
  {
    "url": "images/2017/10/storage-account-key-150x150.png",
    "revision": "6e0c6f3fc0f1aba82d9a29e2d1d719db"
  },
  {
    "url": "images/2017/10/storage-account-key-300x151.png",
    "revision": "f245c9710dc27606eb48c6af810f46ae"
  },
  {
    "url": "images/2017/10/storage-account-key-640x360.png",
    "revision": "f23cf42e938fff435df59c5da2f38182"
  },
  {
    "url": "images/2017/10/storage-account-key-768x386.png",
    "revision": "4fa902cc3c5dc3b4aff5577464f4f0e5"
  },
  {
    "url": "images/2017/10/storage-account-key.png",
    "revision": "e6356d480f405ded66997446066641f5"
  },
  {
    "url": "images/2017/10/timeout-1024x461.png",
    "revision": "df8db8c8e3d96b6e59acc2de246fe7d7"
  },
  {
    "url": "images/2017/10/timeout-150x150.png",
    "revision": "498beee36f21a1bac6d0d24d78da87da"
  },
  {
    "url": "images/2017/10/timeout-300x135.png",
    "revision": "479bc3464dae124a611be7eac9a9bbbb"
  },
  {
    "url": "images/2017/10/timeout-640x360.png",
    "revision": "40bbf2ec120e3869371ea370f5611dc4"
  },
  {
    "url": "images/2017/10/timeout-768x346.png",
    "revision": "db64b8f4781aed45b8cb894dcfc7e0dc"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983-1024x456.png",
    "revision": "e10ad31396e4649e3b568dda1a6f249e"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983-150x150.png",
    "revision": "c553d445852afc574258c3ddc5f6e8a8"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983-300x133.png",
    "revision": "4d5b149e94a397b3d7cb2469c3c3a608"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983-640x360.png",
    "revision": "2684111578cea048c2b62690b807d836"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983-768x342.png",
    "revision": "702881cb6cd5bcb0039422ce769f0675"
  },
  {
    "url": "images/2017/10/timeout-e1508918816983.png",
    "revision": "f061c3402b81295f0f0ac79858c45343"
  },
  {
    "url": "images/2017/10/timeout.png",
    "revision": "cc7ad6c9be7c72b64af1974a574ae11c"
  },
  {
    "url": "images/2017/10/vsts-1-1-1024x483.png",
    "revision": "f5f52e9ce78287176f6cf96f6fd75da8"
  },
  {
    "url": "images/2017/10/vsts-1-1-150x150.png",
    "revision": "0897345e614500f9b4909c08844caa8e"
  },
  {
    "url": "images/2017/10/vsts-1-1-300x142.png",
    "revision": "d984429d41c1247a67b58c0ee09aecff"
  },
  {
    "url": "images/2017/10/vsts-1-1-640x360.png",
    "revision": "03667f734bafc11f42259974fc27468d"
  },
  {
    "url": "images/2017/10/vsts-1-1-768x363.png",
    "revision": "bfb7020af3ac5ac2c45a6a8e37861775"
  },
  {
    "url": "images/2017/10/vsts-1-1.png",
    "revision": "5c0ee41f80172c20462dcf435bcbadbb"
  },
  {
    "url": "images/2017/10/vsts-1-1024x640.png",
    "revision": "693b44508645066db5c439294640016d"
  },
  {
    "url": "images/2017/10/vsts-1-150x150.png",
    "revision": "19eb1169090f08ec113b6b5dca508446"
  },
  {
    "url": "images/2017/10/vsts-1-300x188.png",
    "revision": "7e83230e71343d9d41ac0a271eeed25f"
  },
  {
    "url": "images/2017/10/vsts-1-640x360.png",
    "revision": "74a1c92adc130002cae511ae041a4917"
  },
  {
    "url": "images/2017/10/vsts-1-768x480.png",
    "revision": "05fd2784a7c68de30179470714263e34"
  },
  {
    "url": "images/2017/10/vsts-1.png",
    "revision": "5c217da91f74907b376586fbeb40c7a5"
  },
  {
    "url": "images/2017/10/vsts-2-1-1024x426.png",
    "revision": "17a2c95d40e1f4db17b570aa20235161"
  },
  {
    "url": "images/2017/10/vsts-2-1-150x150.png",
    "revision": "8f6d40a2bb850bf8ac6c268845c27d8f"
  },
  {
    "url": "images/2017/10/vsts-2-1-300x125.png",
    "revision": "347122a59f6abfabe6c4e67231693d91"
  },
  {
    "url": "images/2017/10/vsts-2-1-640x360.png",
    "revision": "23a4a92c7c2e14f8bf65caf8a0fa0b2c"
  },
  {
    "url": "images/2017/10/vsts-2-1-768x320.png",
    "revision": "91b492f74744ac45653df455e68eff63"
  },
  {
    "url": "images/2017/10/vsts-2-1.png",
    "revision": "4ff7b269033c55eadee5d9e5eb9f9ee1"
  },
  {
    "url": "images/2017/10/vsts-2-1024x640.png",
    "revision": "457046ae0fa651701a9afa61b135a43a"
  },
  {
    "url": "images/2017/10/vsts-2-150x150.png",
    "revision": "f7975f2a57bca320051dc4eeb8f79a44"
  },
  {
    "url": "images/2017/10/vsts-2-300x188.png",
    "revision": "7a2279b53ac94ac575049c05ba342b45"
  },
  {
    "url": "images/2017/10/vsts-2-640x360.png",
    "revision": "e87e548d7850f94c5ee7f43186d6b8c4"
  },
  {
    "url": "images/2017/10/vsts-2-768x480.png",
    "revision": "c1067611611e5ad86370122ab5903270"
  },
  {
    "url": "images/2017/10/vsts-2.png",
    "revision": "e7cdc04ace69c320e1cfd0568f927f49"
  },
  {
    "url": "images/2017/10/vsts-3-1-1024x269.png",
    "revision": "df2cc105b26860c7cf4eed1297f42489"
  },
  {
    "url": "images/2017/10/vsts-3-1-150x150.png",
    "revision": "29a1193c4f31aed92473d23d57f6e4d4"
  },
  {
    "url": "images/2017/10/vsts-3-1-300x79.png",
    "revision": "2c7758726e3eab17d49746a739b816a9"
  },
  {
    "url": "images/2017/10/vsts-3-1-640x326.png",
    "revision": "03fa65f9d609eb59c6b5528b53811937"
  },
  {
    "url": "images/2017/10/vsts-3-1-768x202.png",
    "revision": "124faccc94ed8d52ad93a5546f80c4a7"
  },
  {
    "url": "images/2017/10/vsts-3-1.png",
    "revision": "7a14734cb671a5f66f1b2f79a8b03d05"
  },
  {
    "url": "images/2017/10/vsts-3-1024x640.png",
    "revision": "c1d2509e2c92ac8650bff42bf0647484"
  },
  {
    "url": "images/2017/10/vsts-3-150x150.png",
    "revision": "68b68840b223a5f98fb180feb4833537"
  },
  {
    "url": "images/2017/10/vsts-3-300x188.png",
    "revision": "91fabf871c78d4717a6e004dac6b391e"
  },
  {
    "url": "images/2017/10/vsts-3-640x360.png",
    "revision": "f8e0e2b96664f894887efe5686d31747"
  },
  {
    "url": "images/2017/10/vsts-3-768x480.png",
    "revision": "fd278ad9e4fe169f7e65c92889d8b23f"
  },
  {
    "url": "images/2017/10/vsts-3.png",
    "revision": "c867fe100febed846f03ac96fee1e592"
  },
  {
    "url": "images/2017/10/vsts-create-1-1024x158.png",
    "revision": "8ac9c8eaa80bc1cf05b14caad347bb8d"
  },
  {
    "url": "images/2017/10/vsts-create-1-150x150.png",
    "revision": "4cc75b57269ba322256c5139d68c466b"
  },
  {
    "url": "images/2017/10/vsts-create-1-300x46.png",
    "revision": "bed8242600037e711b7dba16b8852332"
  },
  {
    "url": "images/2017/10/vsts-create-1-640x158.png",
    "revision": "d8af31c163f3548d71f4e46c49ac70ec"
  },
  {
    "url": "images/2017/10/vsts-create-1-768x118.png",
    "revision": "c8c3ae069e833b35ad9990a2428a8cc4"
  },
  {
    "url": "images/2017/10/vsts-create-1.png",
    "revision": "3e0b2f8f51059943e7ef6b66d98a25d0"
  },
  {
    "url": "images/2017/10/vsts-create-2-1024x183.png",
    "revision": "3997ab92f8653532a559d256c1b6c1d0"
  },
  {
    "url": "images/2017/10/vsts-create-2-150x150.png",
    "revision": "a78e07eecc9149174bea27703c9d3f59"
  },
  {
    "url": "images/2017/10/vsts-create-2-300x54.png",
    "revision": "ecffd71ab1adde6261a868823688f81d"
  },
  {
    "url": "images/2017/10/vsts-create-2-640x185.png",
    "revision": "bf37a9d2b01d9f8eb0a1e8356cf6c251"
  },
  {
    "url": "images/2017/10/vsts-create-2-768x137.png",
    "revision": "9f4344ccf7a3543edf4a0d7dec200b98"
  },
  {
    "url": "images/2017/10/vsts-create-2.png",
    "revision": "18f110d7320e77db82ca416f55f684bc"
  },
  {
    "url": "images/2017/10/vsts-create-3-1024x470.png",
    "revision": "7332fd622be31984447018c1ed5ab617"
  },
  {
    "url": "images/2017/10/vsts-create-3-150x150.png",
    "revision": "3f7149e6a12b64a97f0cbf0e0de17276"
  },
  {
    "url": "images/2017/10/vsts-create-3-300x138.png",
    "revision": "81de12d48b3e44538d7442c13b48f453"
  },
  {
    "url": "images/2017/10/vsts-create-3-640x360.png",
    "revision": "116362b9c5577df7e32b9f085271dc23"
  },
  {
    "url": "images/2017/10/vsts-create-3-768x352.png",
    "revision": "213c7d4aa944923d54dcd440eff30e2a"
  },
  {
    "url": "images/2017/10/vsts-create-3.png",
    "revision": "e3b49070c91796557b311438e5776426"
  },
  {
    "url": "images/2017/10/vsts-create-4-1024x499.png",
    "revision": "796c086a463f4c8be1d5d4216d10b7c0"
  },
  {
    "url": "images/2017/10/vsts-create-4-150x150.png",
    "revision": "fc48ecf4de36bc227391f27d15fa68ab"
  },
  {
    "url": "images/2017/10/vsts-create-4-300x146.png",
    "revision": "ccac70d711e26d6f28af4ae847197582"
  },
  {
    "url": "images/2017/10/vsts-create-4-640x360.png",
    "revision": "44acf9cf72eaf2af3a9b2197daf940a0"
  },
  {
    "url": "images/2017/10/vsts-create-4-768x374.png",
    "revision": "bf8fca2f4a2624f1b54a76a355dc4b23"
  },
  {
    "url": "images/2017/10/vsts-create-4.png",
    "revision": "b0e2cdff29c10c3dc578f469c5531151"
  },
  {
    "url": "images/2017/10/vsts-create-5-1024x672.png",
    "revision": "a031a9a4e6a6e621959455dc44a77aa2"
  },
  {
    "url": "images/2017/10/vsts-create-5-150x150.png",
    "revision": "181005eae318bbe81f1b0c9154cdf0f7"
  },
  {
    "url": "images/2017/10/vsts-create-5-300x197.png",
    "revision": "d9181aabf037e1bacce6e11566345ccb"
  },
  {
    "url": "images/2017/10/vsts-create-5-640x360.png",
    "revision": "734faba28f477da3cc0c073c70341c4b"
  },
  {
    "url": "images/2017/10/vsts-create-5-768x504.png",
    "revision": "eb072b8ccedb0f5467de48de00b4c7ca"
  },
  {
    "url": "images/2017/10/vsts-create-5.png",
    "revision": "958d243cd28597c11ed8f3c3a0d91372"
  },
  {
    "url": "images/2017/10/vsts-create-6-1024x554.png",
    "revision": "f060da20c3306a716b9abc49a8971413"
  },
  {
    "url": "images/2017/10/vsts-create-6-150x150.png",
    "revision": "abf36b2af9e43fc408153f9fcf83f6e4"
  },
  {
    "url": "images/2017/10/vsts-create-6-300x162.png",
    "revision": "69bc83f8a644ee0a1a2822f5353de5ae"
  },
  {
    "url": "images/2017/10/vsts-create-6-640x360.png",
    "revision": "fe919a4a378161fd8cb489247e23e985"
  },
  {
    "url": "images/2017/10/vsts-create-6-768x416.png",
    "revision": "217c1f053318a05af57d945a5c7958f9"
  },
  {
    "url": "images/2017/10/vsts-create-6.png",
    "revision": "b3b755c3bbb09cb3e7cba8cc4a03a9af"
  },
  {
    "url": "images/2017/10/vsts-create-7-1024x598.png",
    "revision": "782b9a204dae45a41537c6df1d399b19"
  },
  {
    "url": "images/2017/10/vsts-create-7-150x150.png",
    "revision": "37ead09e5f4be04af493d4087fbed5b1"
  },
  {
    "url": "images/2017/10/vsts-create-7-300x175.png",
    "revision": "16fbdb98467ccb56315fa2f21b72cc38"
  },
  {
    "url": "images/2017/10/vsts-create-7-640x360.png",
    "revision": "9959a15216abee2c57748bed78392164"
  },
  {
    "url": "images/2017/10/vsts-create-7-768x449.png",
    "revision": "31d16476a3833f5ec37630612046047a"
  },
  {
    "url": "images/2017/10/vsts-create-7.png",
    "revision": "030e050c19f644e13b2489e9ef70199a"
  },
  {
    "url": "images/2017/10/vsts-create-8-1024x822.png",
    "revision": "f62f8edb49af74298e8ca6696db8c358"
  },
  {
    "url": "images/2017/10/vsts-create-8-150x150.png",
    "revision": "ed4af7b2915ad1140c3d8c1d64eb53f1"
  },
  {
    "url": "images/2017/10/vsts-create-8-300x241.png",
    "revision": "887ce8057fbeccb076d3c841190b48ec"
  },
  {
    "url": "images/2017/10/vsts-create-8-640x360.png",
    "revision": "ba04b0a8d960b44e1a3f545b25a1d8fe"
  },
  {
    "url": "images/2017/10/vsts-create-8-768x617.png",
    "revision": "17c5a06009baeccf37a699fa24300ff0"
  },
  {
    "url": "images/2017/10/vsts-create-8.png",
    "revision": "d6c0cdb1afe557fe3ca2921f28ebf6d2"
  },
  {
    "url": "images/2017/10/vsts-create-9-150x108.png",
    "revision": "de5ef0c24eb8edebb3e5966ddc5bf2f7"
  },
  {
    "url": "images/2017/10/vsts-create-9-300x33.png",
    "revision": "e4af86c70681c508731671db550226aa"
  },
  {
    "url": "images/2017/10/vsts-create-9-640x108.png",
    "revision": "966d302b4639f81e64d726c9cb917992"
  },
  {
    "url": "images/2017/10/vsts-create-9-768x84.png",
    "revision": "1fd4d89552de8508f4be10f111cdab54"
  },
  {
    "url": "images/2017/10/vsts-create-9.png",
    "revision": "c3aae3abc8f0663b1583b492d7705281"
  },
  {
    "url": "images/2017/10/vsts-task-2-1024x616.png",
    "revision": "966bead2fbfd115b6c931db781e934ab"
  },
  {
    "url": "images/2017/10/vsts-task-2-150x150.png",
    "revision": "6314c82d796d839bb08f222ecbdbde2f"
  },
  {
    "url": "images/2017/10/vsts-task-2-300x180.png",
    "revision": "f88890802254988749f5b3c6ec42b775"
  },
  {
    "url": "images/2017/10/vsts-task-2-640x360.png",
    "revision": "85bb6f61cc41eeb68739d18252311be9"
  },
  {
    "url": "images/2017/10/vsts-task-2-768x462.png",
    "revision": "5b65abe9868f9234d8d8cd84b00f9e16"
  },
  {
    "url": "images/2017/10/vsts-task-2-e1508916330661-150x150.png",
    "revision": "4867710767cab2645a02e3b8e92f99d9"
  },
  {
    "url": "images/2017/10/vsts-task-2-e1508916330661-300x297.png",
    "revision": "b87b5ae463dc0c51228a34a6863aa415"
  },
  {
    "url": "images/2017/10/vsts-task-2-e1508916330661-504x360.png",
    "revision": "01aba28bdeb5f96594f69c37feb43235"
  },
  {
    "url": "images/2017/10/vsts-task-2-e1508916330661.png",
    "revision": "77af732118d77639d19d3a6435f09731"
  },
  {
    "url": "images/2017/10/vsts-task-2.png",
    "revision": "8e994bc0594c670796fb9116fecac6b6"
  },
  {
    "url": "images/2018/03/infrastructure-150x150.png",
    "revision": "75ed38b7215be06f8a84f24d431af3ea"
  },
  {
    "url": "images/2018/03/infrastructure-300x162.png",
    "revision": "dc437903c59c81c0d038439ad871516c"
  },
  {
    "url": "images/2018/03/infrastructure-640x360.png",
    "revision": "7b1ff1b4cb2c11bad4f528bfcaa1103a"
  },
  {
    "url": "images/2018/03/infrastructure-768x414.png",
    "revision": "a3df8763ecdc86a5c152883220059cf0"
  },
  {
    "url": "images/2018/03/infrastructure.png",
    "revision": "f785194be152b3e525a89334dfe76d87"
  },
  {
    "url": "images/2018/04/download-150x150.jpg",
    "revision": "99632cf9b0d4808be662115c672a07ff"
  },
  {
    "url": "images/2018/04/download.jpg",
    "revision": "0ff759e8babefb7a79e4e3cd7ae584fd"
  },
  {
    "url": "images/2018/06/img_0447-150x150.jpg",
    "revision": "001d77f9aa4a4f5ef9120b95ea27488b"
  },
  {
    "url": "images/2018/06/img_0447-214x300.jpg",
    "revision": "f4ac20a1fcebed8b2ebf4b29dc1611f4"
  },
  {
    "url": "images/2018/06/img_0447-500x360.jpg",
    "revision": "fba34f7bedb3e1955617d3959b6d4991"
  },
  {
    "url": "images/2018/06/img_0447.jpg",
    "revision": "ccf4550b689c5428c6afe263374d28b8"
  },
  {
    "url": "images/Fichier_.xyz_logo.svg",
    "revision": "af77fc97f2328253010a181735242f40"
  },
  {
    "url": "images/search.svg",
    "revision": "55473c271992498166a1e0682f38d393"
  },
  {
    "url": "images/xyz-192.png",
    "revision": "8ea65373f738da0fed5fb0b4c2bd65e7"
  },
  {
    "url": "images/xyz-192.svg",
    "revision": "ac7def42b377f4c4a87bd47c65cde640"
  },
  {
    "url": "images/xyz-512.svg",
    "revision": "5b5198723eaae333284bd9f7668f6bc1"
  },
  {
    "url": "images/XYZ.svg",
    "revision": "9f5d6a56d2e6b6c010f3051d6b308d1d"
  },
  {
    "url": "index.html",
    "revision": "68317bc091e421f1f02e82917a1d5a32"
  },
  {
    "url": "js/data.js",
    "revision": "b4938cec7d27cc70c413bbd9b495c1ae"
  },
  {
    "url": "js/script.js",
    "revision": "17723de196ea6c0512b61171acab4976"
  },
  {
    "url": "manifest.json",
    "revision": "f4a3cbd089584373f5127e6bf5df5022"
  },
  {
    "url": "posts/0/index.html",
    "revision": "e2ab29bc9f47e8b6118d8dae457c2267"
  },
  {
    "url": "posts/1/index.html",
    "revision": "4ea6081fd06cf18fc875f35932d50456"
  },
  {
    "url": "posts/2/index.html",
    "revision": "42df4c7684cec2444f44990d0bc08fe0"
  },
  {
    "url": "privacy/index.html",
    "revision": "e28228dee49be84d5016bde7585c544b"
  },
  {
    "url": "tags/Ansible/index.html",
    "revision": "5f3aafa371142c8eea888f2475f0ec68"
  },
  {
    "url": "tags/Azure Cli/index.html",
    "revision": "eccc63d80801666e7117d736f772bae4"
  },
  {
    "url": "tags/Azure Devops/index.html",
    "revision": "4dfa7cee18d71ac426da16ff32694736"
  },
  {
    "url": "tags/Azure Stack/index.html",
    "revision": "694ac3f100d4bd85be9e1c7d9acc717b"
  },
  {
    "url": "tags/Azure/index.html",
    "revision": "75c69a26412b8eb305c797fe9636202f"
  },
  {
    "url": "tags/Cloud/index.html",
    "revision": "363a029b65eb26e3171ff7d658bb6c64"
  },
  {
    "url": "tags/English/index.html",
    "revision": "b152279f4850b0f02d24f18d10622bed"
  },
  {
    "url": "tags/French/index.html",
    "revision": "4208370cf00d13858bf94d17fe92ee97"
  },
  {
    "url": "tags/Fun/index.html",
    "revision": "0f99b13b892c82d92ab8d9a70817eda6"
  },
  {
    "url": "tags/Git/index.html",
    "revision": "0465d47f42b76ffc73d4efde9c2be281"
  },
  {
    "url": "tags/index.html",
    "revision": "2e53cb50ecd70bee2812df07fcf326f1"
  },
  {
    "url": "tags/Infra as Code/index.html",
    "revision": "5201c2f0a168ba7f5dd9f9710a77af8a"
  },
  {
    "url": "tags/Linux/index.html",
    "revision": "18833708612c260c7bda524844918ee3"
  },
  {
    "url": "tags/macOs/index.html",
    "revision": "1bef6d98e3a2927e7fa2cb5cfc2f9d58"
  },
  {
    "url": "tags/nav/index.html",
    "revision": "c2ad75231bc0e5284fa237a951dd3e17"
  },
  {
    "url": "tags/Networking/index.html",
    "revision": "cf09c8ab0bc7e6bc079281c088338c89"
  },
  {
    "url": "tags/Nginx/index.html",
    "revision": "68b7e9d8ccca345539c2a9b1bfe37db0"
  },
  {
    "url": "tags/Powershell/index.html",
    "revision": "62e461a944881b5c34c7eab38808951e"
  },
  {
    "url": "tags/PowerShell/index.html",
    "revision": "d4c89aa4f6db90e947d2a358e7fab924"
  },
  {
    "url": "tags/Reverse Proxy/index.html",
    "revision": "e062a8725db3e05f2dc1e3ca543f7dac"
  },
  {
    "url": "tags/searchable/index.html",
    "revision": "a505b49cc1db20b7695e4e17717f5132"
  },
  {
    "url": "tags/tagList/index.html",
    "revision": "e9f988278a88763656f540a71ff7c995"
  },
  {
    "url": "tags/Teams/index.html",
    "revision": "801699e3b05fae507fc1aa005ae8a326"
  },
  {
    "url": "tags/Terraform/index.html",
    "revision": "a4f96941e77dfa61b82bf5ec335e1e2d"
  },
  {
    "url": "tags/Tests/index.html",
    "revision": "edb6acf2308d9cddd09c74f62bcf579c"
  },
  {
    "url": "tags/Tips &amp; Tricks/index.html",
    "revision": "aecbfb80860d4b5f0fdeefef9891240a"
  },
  {
    "url": "tags/updated/index.html",
    "revision": "e642b063939434c30dba7c6d33c0758b"
  },
  {
    "url": "tags/Visual Studio Code/index.html",
    "revision": "a10861655533053e07114c69b4f810a0"
  },
  {
    "url": "tags/Windows/index.html",
    "revision": "c7abc2d54cf9fceb9092aa173404eb8a"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/^.*\.(html|jpg|png|gif|webp|ico|svg|woff2|woff|eot|ttf|otf|ttc|json)$/, new workbox.strategies.StaleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/^https?:\/\/fonts\.googleapis\.com\/css/, new workbox.strategies.StaleWhileRevalidate(), 'GET');
