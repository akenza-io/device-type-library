import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("TWTG Neon Vibration", () => {
  let alertSchema = null;
  let axisXSchema = null;
  let axisYSchema = null;
  let axisZSchema = null;
  let axisXspectrumSchema = null;
  let axisYspectrumSchema = null;
  let axisZspectrumSchema = null;
  let bootSchema = null;
  let configurationSchema = null;
  let deactivationSchema = null;
  let errorSchema = null;
  let factoryResetSchema = null;
  let fragmentStartSchema = null;
  let fragmentSchema = null;
  let lifecycleSchema = null;
  let lifecycleResponseSchema = null;
  let machineFaultSchema = null;
  let statisticsSchema = null;
  let statusSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    [
      alertSchema, axisXSchema, axisYSchema, axisZSchema,
      axisXspectrumSchema, axisYspectrumSchema, axisZspectrumSchema,
      bootSchema, configurationSchema, deactivationSchema,
      errorSchema, factoryResetSchema, fragmentSchema,
      fragmentStartSchema, lifecycleSchema, lifecycleResponseSchema,
      machineFaultSchema, statisticsSchema, statusSchema
    ] = await Promise.all([
      loadSchema(`${__dirname}/alert.schema.json`),
      loadSchema(`${__dirname}/axis_x.schema.json`),
      loadSchema(`${__dirname}/axis_y.schema.json`),
      loadSchema(`${__dirname}/axis_z.schema.json`),
      loadSchema(`${__dirname}/axis_x_spectrum.schema.json`),
      loadSchema(`${__dirname}/axis_y_spectrum.schema.json`),
      loadSchema(`${__dirname}/axis_z_spectrum.schema.json`),
      loadSchema(`${__dirname}/boot.schema.json`),
      loadSchema(`${__dirname}/configuration.schema.json`),
      loadSchema(`${__dirname}/deactivation.schema.json`),
      loadSchema(`${__dirname}/error.schema.json`),
      loadSchema(`${__dirname}/factory_reset.schema.json`),
      loadSchema(`${__dirname}/fragment.schema.json`),
      loadSchema(`${__dirname}/fragment_start.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/lifecycle_response.schema.json`),
      loadSchema(`${__dirname}/machine_fault.schema.json`),
      loadSchema(`${__dirname}/statistics.schema.json`),
      loadSchema(`${__dirname}/status.schema.json`)
    ]);
  });

  describe("consume()", () => {
    it("should decode the TWTG Neon Vibration lifecycle payload", () => {
      const data = {
        data: {
          port: 14,
          payloadHex: "10c81dab653387bc",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.transmitterChargeUsed, 1038);
        assert.equal(value.data.sensorChargeUsed, 3506);
        assert.equal(value.data.averageTemperature, 19.515625);
        assert.equal(value.data.batteryLevel, 94);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration configuration", () => {
      const data = {
        data: {
          port: 11,
          payloadHex: "00aabbccdd0010",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.tag, "aabbccdd");
        assert.equal(value.data.deviceConfiguration, "TRANSMITTER");
        assert.equal(value.data.updateStatus, "SUCCESS");

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment start", () => {
      const data = {
        data: {
          port: 12,
          payloadHex: "0011200020075BCD15",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fragment_start");
        assert.equal(value.data.port, 17);
        assert.equal(value.data.uplinkSize, 8192);
        assert.equal(value.data.fragmentSize, 32);
        assert.equal(value.data.crc, 123456789);

        validateSchema(value.data, fragmentStartSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.concatedPayload, "");
        assert.equal(value.crc, 123456789);
        assert.equal(value.port, 17);
        assert.equal(value.streamingFragments, true);
        assert.equal(value.streamingNonRedundant, true);
        assert.equal(value.uplinkSize, 8192);
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment", () => {
      const data = {
        state: {
          streamingFragments: true,
          streamingNonRedundant: true,
          crc: 123456789,
          uplinkSize: 8192,
          port: 17,
          concatedPayload: "",
        },
        data: {
          port: 12,
          payloadHex: "100001000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fragment");
        assert.equal(value.data.index, 1);
        assert.equal(value.data.fragmentType, "PLAIN");

        validateSchema(value.data, fragmentSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.crc, 123456789);
        assert.equal(value.port, 17);
        assert.equal(value.streamingFragments, true);
        assert.equal(value.streamingNonRedundant, true);
        assert.equal(value.uplinkSize, 8192);
        assert.deepEqual(value.concatedPayload, "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f")
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment and emit the concated payload", () => {
      const data = {
        state: {
          streamingFragments: true,
          streamingNonRedundant: true,
          crc: 2183296979,
          uplinkSize: 4797,
          port: 17,
          concatedPayload: "5068b00db28183e98450025011db52a3544a71c3b00100329af78a09244912a90c7e229fffed6f9c18d1fb2c0de9c9e550eedab1c457cce328fa1a436479dd898f2afea89b8f9bca7cbb5454ac5d41568638ee32102502389c91c1a0bd669a0540df248c54158569919228d04b016105f49a1b22c4525e1c14868f3b0ee3d91e491820e8d1174c132df4490b76f67f841f84d44b476745298cb31ad3a52b56a2d0848959d88468b06a152200dd260b80e4720c865385283ba3d33584670a32b0fa6c53a2d80c32c6f2a4ca87ad80bdaf6b50f4b614c4b1f2e15f16195330d05850d3089e341913d40f3449454cb9388801690629074562129521f3c8ed1ccab4ae5c80cdf120e836d658de6f6ec7f4b1e530d94a062b24e8a5bc621546e6dd083bc6b1e49f0d88b3cc50294832e0f3138e3592f2ef17f684934d13f5069157d0861897225a15d0fa4412546cb429112374874f45e39915330f867a5abe18a1c5695211b7c59b4c180500b38cdb724dc4298d633c7b609572c8f55492342e05864c7441114e1352e0a6665e13d483289196e62b87de66d14b8d2342a90a86cdc725c64e4ce261986c8ab33097151ac96a03929471a11417930a5b45a60dd1bd68aae560b9473104337de564861339212c91a2a8af344c36fcf23a4dd55dbd6b1569fa350c06924c61328184343123d0c6f1794d26f7847e4f503270122e4ff319a91cd50601524a4fd41cf968e0b6510d17c412dd356f4930d0ab6a616915265f4bb3dced4203d110a21a0863398f7458d6391e5e16e2694b3c56276580620b52749971d893da3c6d51f3cca7485f37a94c2584327557561f27fde9779f530d85779557467fa11c9881c023cef4cd946bd4e58951171947c997324e8198c34c518699ad70dae3c0c048db329941440b337d1a3449560a8c6006167e284d474400fd34a18975d344c8d5e214749bda21b32388071a5f5c4e620d6c6f66bc5188214ea35c5a194f157a196184d34c24234b7198fb8d8719ce1281a52634f22c88b2f5c63f52e18968aadf94252d4707c2a52b250925a5856050823889368c54d644648ad2d05a551202004f20882135509057e4e02459552855882c889518bf3a5eb785486194a6b9da1fd072212ba7c767857345dee4dc68214c9585724aa306995d6f184084b72ad34425bb896325316153d8e3f051309410c5215789a340a12a07a1a8a0559692b0e0264bd17d1f428ff505091396f5b5041b14aadf35959371e942428443dd7272180374687951853d676a95b40d50794d7695de40c863c9895c14b230d1308f1599b3388f1475aa424ab812321c11a4bce23c169240c65d01761d72058742306a190594f95930972550ef4c9064053d6cd316b4c72016e6a8b21c54f4194582a037e99c3c1240963f674eb4c146278c9510dc3b9bc85cf3151315b0d834cb53e93f1a524619c83388c268c32088d31ceb1f88e4891433cb728545271d98c93a18cf0719533f48e2c0b614cae274b08e1804bd4d1e4c46d1f54f90b3645b2049c3a9083540a551392f8850e0f22b46a11519405f03b9b28cda573a0673cbe2d8ff5392d3cd519a683698661f4b17320c36191238953b95c1a0b486e7a589c0398d746d1387603731f4785294eda337c8823c69464e04815e4407a5d56b2a89d7edad33872229e69346b8d1f63f9a3439182cd01398c3485a26eda2a01563c5ab319c98c9b3b45fc99a4a565241ed378f6a893d4f8f54e401f36e50799d5e1e0621bd0f2c0b1762839ede773634541c973c4d42094305ce63c53201123747a2847319476315d676c2e3f5697b91733d8373d473293d64d023a8dd30cf2311164b1bb72d8b3fcb2669646e9f664546299223bce21c8ae10d846c8e0381823c97a698b32683c050f45d8f54e187471433ed2660d2c1dd4455c921f1467f6985d4692d0f63e4b1384d9179123a479351ae3fc40469c4349198b5ae2603b218e65fd5a26cd22d118331f07494c611d46666b99cb4558306a6977588a2553034cbb439b94305908240a8c7d3749c351296a6475c0624acf9229097b8d02fcce1f922acb1e4e54a400f50e4792048f4dda971dd74682e16c8b12d0f5853959ca92351d2f0ba3409f2f126722657043c7bb4b61cb91a837218b64388d284425855b38561b9f62a8ddf6159f6bc8f388144819327d738cd9b1c99f3f8ac2a0f63eceb2cc44485bc50498649ed210e840857891ff47049471384ea318c64aa05f94885e55578245804d86a5ed446c2515852b0cd124bd852ddb059c4f742115b0f20a85a3b16d2cd5729503234d146ca85d95f7756129c43591e1b86587fc467c549170901519c4a4ca68a0e420a43e9a82f49f15c183888f190a7278e11a5b371db464d2e151b647a1e78cf6371450e4d31e0682147e1a43b46e307292261de05089572275929571b16360cdd5b85e3e4c24b8485090a14c937bf5da186c3f9402085d328205e5f649d0b160d8889e55503343d3e5bdb17289d5f95172d1c204ab42d2287521725583688f1208b17c990c0b464640729d6500ab1997631497298f352d97d016550cd6409824510d36ce16e96522c600e0fc5258b63564288eb0c96b220cf4a11d49e6550c8c2ad0127507936386bd892c98173c412695c6d0e82c908969e039077409224c1723d4c73cd1d2f41c048e44f8791b14d688f83a4ec33a7346c950bc8726436548f5240d0274e123c1a1fcc74acb31cc5813936600e517cfa81dca4fcff40d7b3a560831aba1a1a09ce74ed0518c813a5a5598992988727997474b3331286082b5f11d2ecb32647c1d4921dc7e4184921c6e6f9ef2b9af1357c3792e35d033f8e3300ed63deb344428de7d6587f24c9d579c745d723aca67812b29d5777ef4b31322bc993cd00381d0460561805d1a0cb66d9f3c074791a33d4704f4961a09d80a4d561ce1209d61d297c4a55ece96097470508228772c8442a49b4851a4d1533811c1cc991188a2dcfe78d7647d37344d3500d01a9265d463244fa5a149535225f5b2609c57dd19390cd158963dcfb2898e5b8bc3f4492ec822a0d115c2547c3c6064b251a5836dd8684910cbf98e4447db8590da80a196ed0d40d9c5184b2acbf3e8d23807c4216e400712513caaee66488c07c880a8eb5615a8d6566ea6669cbc4d1a47e59a618de354a71a46c5010b3946318645f3e485811a6a5c43a05935db06fc377a8be47c777d1df158f92695654919291821491127c9b4a90f511f1630245857b93afc54d761b08e3fddb73c4c30998811253eca01049e3354938daf484885413a0a8df37d793a50e68cef211336e19724cf33e8303848a269041e4a83f03e434b85615a33cb02584e4b95a2c60c9f8ae398ec06a0acb2aa731db665e574d839dd351f0c23e0de38cbe30c9f384cb2586c260fe0a93e3e58866962320503cd0b4e9bc50c562289229490405012e0e587a5b8a85863c71514cf150cf22cac360b22355144d212a0581f5cb9485bbefbfae91c33d4408d1a585393c0a619861489c9771545723f7e1242d0df3fd7f3d5636054b565a04208743d4f2ed551112320c9c5a9aa5dc9a305136f5644155a40c5b1d02e3cd4028d21849da8f0e6200aa3f4d1234c23e9c14683c4560b35d6d455796e0bd2cd84428332413d518bb454e84e5893e1d14fdfda5d09090531bc845c6586ccdd17441141372b0b44e1694059a3f8db1e14e3e96e585839d65a59cf21de06659387818b408531549a4418b6ccf85ed55491bc7b5872d5d467d442cd0571dc24848366d006226b58c8c46582568c5239001f1273f49132618530e850545539c85cce53302d1dd3a3148e20c9a164964a9fa414596b9904c1595b4e345934428b43356c65a1c7d1552d4b9498eb6591c14927515022005b4417a30c8b46d7436446358d13b4cc3300f254b2400cb62df6384e043d152648463e605e841231631b52557175405426890d4b9b7a7ac89558960097461b48ce1e976243c48241531158aa2f8673f8d63d0fe1f50b7bd2f32ced3e4c90f4141d42357282470db5f54a4b0f91bc531e09e3c5185d59d5ed65264a43287648183531435de038b20667c133a8fd1f12c151424c93e758ec27cfd4e96122889289392e8ed16ca4170ae1acdb675ff788f1271145e8594b0a34c9af0dcfb3ac7c7049b6013458e16498dc271dc5bce652d512a935141394f8c16fdd260d2b1f09a37de2301702d8423147f03c132f46f430fb384a9315c7528903e1ea2ad8d66545350b5485704589d1bd083ad566fd333b0a22fc6131cfd3c545114d7290de629a74896461d9297df80904356d333e2d76c13741067108194394b0d1968158813cea19cf02e86359aa1d8a3e5a91d595e7638a44cd19365683c1f17b940420ca390ff32cf014483248c8120562d93a63dab5009109c1d131554046640d383c919480d46b9b04595f5c9054dcce4546552525358a054943450e954cd230e8cac5882a0de6197842d7b43c6b7be0b4a1192752a435575e4e0461888e5cb210d64509637d5c2d0785e4833e552518f32fd3766d3d288492d495200cb1b4f6124be4ed8f2dc4f3b1383e6398a4ef2fc53489f966dbb6cd263d89047097544407832988d2f600c053195284ec864ab655983b07e2b0ef2403d54a397b8d42ec8f4946e3cd6a73d60175401bcd352c8f1e58c6145b290a604cb935c2f2452479d6a4d649b66ae6f8a43a053198b334d10410724056516c6b659e22fd2a344c01713a8bce8410da52cdb370e037a6f6e1936f4a1301473486d30d0261cef1c57c6cd1016c3708d29460cd64cc227035350480cd10430ad4f53127c412bd056f60a195594d5a57fe6443c681c1714e15348833374c4174af6194913ce01b4c4545ec85d105b2537acd34acb747d204a85d23c0e1e07f0d8da5ca095e88b2b8d41946316def898d50ec8e21071200711f9313213a37c8d3c85e8099e4f9187ba0c3212b198881fc836018e5a9908e12d6156c068be080d62dce25f99e44115400cd329a6755505ed7d42d894e0ff2452a388853f0c26fda78cdc0305b26214d524e55d58a3e8ff63d996848e394524e09d2b4d855231624c0509a762d46350df4e1ad6e54736c233bc720e0c02e4a137e258e4b7255ed825e0935942688653e4353892631b3218ba6e1b3584854acf30e0d6560b3354552e0f82693d5c0f9178ab1449f464482d4f53647813c7f365583a1417ddf2771183884a44d240985028d0b1d0c25c18b701552d5573086b1e0ca731ba3553263459691a3976d871104779be1e524428381c102455115286534498248a10eda59c2657512a364eb49cca67d96320f15e98964ab27acc17d14a3d54d3c42c39527105809657a28c5231163778e5531734f8b02250b31cd674e15af1fb6508d3a97353dbd6107815cae0784953cbf21c702e13d439766b0b440931294d351ced2715e2c84e42daf5e10c3bd094d575a62204ccd94e08f24c8d14c893c12d53890214fc3a0f95cd63338cb619764b03c40167530cd6211e378b82a8d0922260fd204410a1a0de3a88e24c8d274710f4ee235c26052e799887617e310c53312733cab6e9a94b16d498ba2acb5340a52f50c588f61951584094558984957c454aa1885227ced3a173a8a59420a235cd432cb84d8ae545ea4ac571acf14c81528092370ae3808e1ed165a5974a0e25309434d6632d0b6d6076148d235212204201cbd11934234f5365044149525c7a711b04d4661aca42a46d2f16f1d0cd47d8d5bd6f38ccb470f91989f218252c61798d10414bf3b1914f9134414e35128430b43f91f331c85d59c6b98360d9235d294906227091154261590b684e5134bf5d55530413290d94a4f74ad9a77df937c88599330b441128fa144615318d1588c2706d0a0e34603421c4a0a4750e9856942d490aa1c0cc328af3e05d43c9e2b10425cd634540630e08f9cc1a050159116dd9e2b97c564e75e8e4470355a9455210a3297247c8935502378dd36c852d2007f95d0493b4e0772c87e2a4a93586c244b63350a44c7f3a0703f15f428ad1c4773d21397c473f8cb34c670805c2c05e41185538b86b56e1d091258e67228771d295bcd83e10d3003703c8a1710a378b320964599345a4af151004f4e83bd1a2b542268443283f2e8bb269452c85b4b18f3387c47ced36884278ac1707804cb25794a2350f0723c9e92218c7c2c4652a0cd1b4f02dc750bc58205e669058404dd179278d138228822d12d34870324da31d81454922a05337c3a18418060665452d0c8d512c892d03f501bf5206f07d1a3a5826a5212ac8c4d5b838c86104b0478c908c7f1b8934e169484c02ecfe3e1635c8ca5a56923cb12e8ee3bcee63cda37511459371444a234e64fcd12bc1308055344e634c49284a93a4e416cca58cf61285428c24218c4288c04b8e71ec82104ab1c92974d6d334692d89f20cb5634b518901540d94c4384c11c18c302395848c5d270933d902194a210c8b1f09b20520230b5324fc228b1278a0554f5389400fcd426cf53989f6651e1f1695d4ee47c801f8f73b4cd3643b2245921022260841a8542502f2f09f2a8c7384c75604f2e10f5189059d7f3ecc72488037dab310e957d0d308c30f8c733cf9434fd4b4fd19d24448ee27c30358e01c8a93f8fb54d74685854e91733c7e05cc523c572fcc12949b28d465f10c0f40b37caf3e9051c858244a93e8301548f525ce4f04529476374913a0"
        },
        data: {
          port: 12,
          payloadHex: "100001000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "axis_z_spectrum");
        assert.equal(value.data.peakAcceleration, 0.0195465087890625);
        assert.equal(value.data.rmsAcceleration, 0.005573272705078125);
        assert.equal(value.data.rmsVelocity, 0.048492431640625);
        assert.equal(value.data.rpm, 1336.8822021484375);
        assert.exists(value.data.frequencies); // Theres a lot
        assert.exists(value.data.magnitudes); // Theres a lot

        validateSchema(value.data, axisZspectrumSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.crc, 2183296979);
        assert.equal(value.port, 17);
        assert.equal(value.streamingFragments, true);
        assert.equal(value.streamingNonRedundant, false);
        assert.equal(value.uplinkSize, 4797);
        assert.deepEqual(value.concatedPayload, "5068b00db28183e98450025011db52a3544a71c3b00100329af78a09244912a90c7e229fffed6f9c18d1fb2c0de9c9e550eedab1c457cce328fa1a436479dd898f2afea89b8f9bca7cbb5454ac5d41568638ee32102502389c91c1a0bd669a0540df248c54158569919228d04b016105f49a1b22c4525e1c14868f3b0ee3d91e491820e8d1174c132df4490b76f67f841f84d44b476745298cb31ad3a52b56a2d0848959d88468b06a152200dd260b80e4720c865385283ba3d33584670a32b0fa6c53a2d80c32c6f2a4ca87ad80bdaf6b50f4b614c4b1f2e15f16195330d05850d3089e341913d40f3449454cb9388801690629074562129521f3c8ed1ccab4ae5c80cdf120e836d658de6f6ec7f4b1e530d94a062b24e8a5bc621546e6dd083bc6b1e49f0d88b3cc50294832e0f3138e3592f2ef17f684934d13f5069157d0861897225a15d0fa4412546cb429112374874f45e39915330f867a5abe18a1c5695211b7c59b4c180500b38cdb724dc4298d633c7b609572c8f55492342e05864c7441114e1352e0a6665e13d483289196e62b87de66d14b8d2342a90a86cdc725c64e4ce261986c8ab33097151ac96a03929471a11417930a5b45a60dd1bd68aae560b9473104337de564861339212c91a2a8af344c36fcf23a4dd55dbd6b1569fa350c06924c61328184343123d0c6f1794d26f7847e4f503270122e4ff319a91cd50601524a4fd41cf968e0b6510d17c412dd356f4930d0ab6a616915265f4bb3dced4203d110a21a0863398f7458d6391e5e16e2694b3c56276580620b52749971d893da3c6d51f3cca7485f37a94c2584327557561f27fde9779f530d85779557467fa11c9881c023cef4cd946bd4e58951171947c997324e8198c34c518699ad70dae3c0c048db329941440b337d1a3449560a8c6006167e284d474400fd34a18975d344c8d5e214749bda21b32388071a5f5c4e620d6c6f66bc5188214ea35c5a194f157a196184d34c24234b7198fb8d8719ce1281a52634f22c88b2f5c63f52e18968aadf94252d4707c2a52b250925a5856050823889368c54d644648ad2d05a551202004f20882135509057e4e02459552855882c889518bf3a5eb785486194a6b9da1fd072212ba7c767857345dee4dc68214c9585724aa306995d6f184084b72ad34425bb896325316153d8e3f051309410c5215789a340a12a07a1a8a0559692b0e0264bd17d1f428ff505091396f5b5041b14aadf35959371e942428443dd7272180374687951853d676a95b40d50794d7695de40c863c9895c14b230d1308f1599b3388f1475aa424ab812321c11a4bce23c169240c65d01761d72058742306a190594f95930972550ef4c9064053d6cd316b4c72016e6a8b21c54f4194582a037e99c3c1240963f674eb4c146278c9510dc3b9bc85cf3151315b0d834cb53e93f1a524619c83388c268c32088d31ceb1f88e4891433cb728545271d98c93a18cf0719533f48e2c0b614cae274b08e1804bd4d1e4c46d1f54f90b3645b2049c3a9083540a551392f8850e0f22b46a11519405f03b9b28cda573a0673cbe2d8ff5392d3cd519a683698661f4b17320c36191238953b95c1a0b486e7a589c0398d746d1387603731f4785294eda337c8823c69464e04815e4407a5d56b2a89d7edad33872229e69346b8d1f63f9a3439182cd01398c3485a26eda2a01563c5ab319c98c9b3b45fc99a4a565241ed378f6a893d4f8f54e401f36e50799d5e1e0621bd0f2c0b1762839ede773634541c973c4d42094305ce63c53201123747a2847319476315d676c2e3f5697b91733d8373d473293d64d023a8dd30cf2311164b1bb72d8b3fcb2669646e9f664546299223bce21c8ae10d846c8e0381823c97a698b32683c050f45d8f54e187471433ed2660d2c1dd4455c921f1467f6985d4692d0f63e4b1384d9179123a479351ae3fc40469c4349198b5ae2603b218e65fd5a26cd22d118331f07494c611d46666b99cb4558306a6977588a2553034cbb439b94305908240a8c7d3749c351296a6475c0624acf9229097b8d02fcce1f922acb1e4e54a400f50e4792048f4dda971dd74682e16c8b12d0f5853959ca92351d2f0ba3409f2f126722657043c7bb4b61cb91a837218b64388d284425855b38561b9f62a8ddf6159f6bc8f388144819327d738cd9b1c99f3f8ac2a0f63eceb2cc44485bc50498649ed210e840857891ff47049471384ea318c64aa05f94885e55578245804d86a5ed446c2515852b0cd124bd852ddb059c4f742115b0f20a85a3b16d2cd5729503234d146ca85d95f7756129c43591e1b86587fc467c549170901519c4a4ca68a0e420a43e9a82f49f15c183888f190a7278e11a5b371db464d2e151b647a1e78cf6371450e4d31e0682147e1a43b46e307292261de05089572275929571b16360cdd5b85e3e4c24b8485090a14c937bf5da186c3f9402085d328205e5f649d0b160d8889e55503343d3e5bdb17289d5f95172d1c204ab42d2287521725583688f1208b17c990c0b464640729d6500ab1997631497298f352d97d016550cd6409824510d36ce16e96522c600e0fc5258b63564288eb0c96b220cf4a11d49e6550c8c2ad0127507936386bd892c98173c412695c6d0e82c908969e039077409224c1723d4c73cd1d2f41c048e44f8791b14d688f83a4ec33a7346c950bc8726436548f5240d0274e123c1a1fcc74acb31cc5813936600e517cfa81dca4fcff40d7b3a560831aba1a1a09ce74ed0518c813a5a5598992988727997474b3331286082b5f11d2ecb32647c1d4921dc7e4184921c6e6f9ef2b9af1357c3792e35d033f8e3300ed63deb344428de7d6587f24c9d579c745d723aca67812b29d5777ef4b31322bc993cd00381d0460561805d1a0cb66d9f3c074791a33d4704f4961a09d80a4d561ce1209d61d297c4a55ece96097470508228772c8442a49b4851a4d1533811c1cc991188a2dcfe78d7647d37344d3500d01a9265d463244fa5a149535225f5b2609c57dd19390cd158963dcfb2898e5b8bc3f4492ec822a0d115c2547c3c6064b251a5836dd8684910cbf98e4447db8590da80a196ed0d40d9c5184b2acbf3e8d23807c4216e400712513caaee66488c07c880a8eb5615a8d6566ea6669cbc4d1a47e59a618de354a71a46c5010b3946318645f3e485811a6a5c43a05935db06fc377a8be47c777d1df158f92695654919291821491127c9b4a90f511f1630245857b93afc54d761b08e3fddb73c4c30998811253eca01049e3354938daf484885413a0a8df37d793a50e68cef211336e19724cf33e8303848a269041e4a83f03e434b85615a33cb02584e4b95a2c60c9f8ae398ec06a0acb2aa731db665e574d839dd351f0c23e0de38cbe30c9f384cb2586c260fe0a93e3e58866962320503cd0b4e9bc50c562289229490405012e0e587a5b8a85863c71514cf150cf22cac360b22355144d212a0581f5cb9485bbefbfae91c33d4408d1a585393c0a619861489c9771545723f7e1242d0df3fd7f3d5636054b565a04208743d4f2ed551112320c9c5a9aa5dc9a305136f5644155a40c5b1d02e3cd4028d21849da8f0e6200aa3f4d1234c23e9c14683c4560b35d6d455796e0bd2cd84428332413d518bb454e84e5893e1d14fdfda5d09090531bc845c6586ccdd17441141372b0b44e1694059a3f8db1e14e3e96e585839d65a59cf21de06659387818b408531549a4418b6ccf85ed55491bc7b5872d5d467d442cd0571dc24848366d006226b58c8c46582568c5239001f1273f49132618530e850545539c85cce53302d1dd3a3148e20c9a164964a9fa414596b9904c1595b4e345934428b43356c65a1c7d1552d4b9498eb6591c14927515022005b4417a30c8b46d7436446358d13b4cc3300f254b2400cb62df6384e043d152648463e605e841231631b52557175405426890d4b9b7a7ac89558960097461b48ce1e976243c48241531158aa2f8673f8d63d0fe1f50b7bd2f32ced3e4c90f4141d42357282470db5f54a4b0f91bc531e09e3c5185d59d5ed65264a43287648183531435de038b20667c133a8fd1f12c151424c93e758ec27cfd4e96122889289392e8ed16ca4170ae1acdb675ff788f1271145e8594b0a34c9af0dcfb3ac7c7049b6013458e16498dc271dc5bce652d512a935141394f8c16fdd260d2b1f09a37de2301702d8423147f03c132f46f430fb384a9315c7528903e1ea2ad8d66545350b5485704589d1bd083ad566fd333b0a22fc6131cfd3c545114d7290de629a74896461d9297df80904356d333e2d76c13741067108194394b0d1968158813cea19cf02e86359aa1d8a3e5a91d595e7638a44cd19365683c1f17b940420ca390ff32cf014483248c8120562d93a63dab5009109c1d131554046640d383c919480d46b9b04595f5c9054dcce4546552525358a054943450e954cd230e8cac5882a0de6197842d7b43c6b7be0b4a1192752a435575e4e0461888e5cb210d64509637d5c2d0785e4833e552518f32fd3766d3d288492d495200cb1b4f6124be4ed8f2dc4f3b1383e6398a4ef2fc53489f966dbb6cd263d89047097544407832988d2f600c053195284ec864ab655983b07e2b0ef2403d54a397b8d42ec8f4946e3cd6a73d60175401bcd352c8f1e58c6145b290a604cb935c2f2452479d6a4d649b66ae6f8a43a053198b334d10410724056516c6b659e22fd2a344c01713a8bce8410da52cdb370e037a6f6e1936f4a1301473486d30d0261cef1c57c6cd1016c3708d29460cd64cc227035350480cd10430ad4f53127c412bd056f60a195594d5a57fe6443c681c1714e15348833374c4174af6194913ce01b4c4545ec85d105b2537acd34acb747d204a85d23c0e1e07f0d8da5ca095e88b2b8d41946316def898d50ec8e21071200711f9313213a37c8d3c85e8099e4f9187ba0c3212b198881fc836018e5a9908e12d6156c068be080d62dce25f99e44115400cd329a6755505ed7d42d894e0ff2452a388853f0c26fda78cdc0305b26214d524e55d58a3e8ff63d996848e394524e09d2b4d855231624c0509a762d46350df4e1ad6e54736c233bc720e0c02e4a137e258e4b7255ed825e0935942688653e4353892631b3218ba6e1b3584854acf30e0d6560b3354552e0f82693d5c0f9178ab1449f464482d4f53647813c7f365583a1417ddf2771183884a44d240985028d0b1d0c25c18b701552d5573086b1e0ca731ba3553263459691a3976d871104779be1e524428381c102455115286534498248a10eda59c2657512a364eb49cca67d96320f15e98964ab27acc17d14a3d54d3c42c39527105809657a28c5231163778e5531734f8b02250b31cd674e15af1fb6508d3a97353dbd6107815cae0784953cbf21c702e13d439766b0b440931294d351ced2715e2c84e42daf5e10c3bd094d575a62204ccd94e08f24c8d14c893c12d53890214fc3a0f95cd63338cb619764b03c40167530cd6211e378b82a8d0922260fd204410a1a0de3a88e24c8d274710f4ee235c26052e799887617e310c53312733cab6e9a94b16d498ba2acb5340a52f50c588f61951584094558984957c454aa1885227ced3a173a8a59420a235cd432cb84d8ae545ea4ac571acf14c81528092370ae3808e1ed165a5974a0e25309434d6632d0b6d6076148d235212204201cbd11934234f5365044149525c7a711b04d4661aca42a46d2f16f1d0cd47d8d5bd6f38ccb470f91989f218252c61798d10414bf3b1914f9134414e35128430b43f91f331c85d59c6b98360d9235d294906227091154261590b684e5134bf5d55530413290d94a4f74ad9a77df937c88599330b441128fa144615318d1588c2706d0a0e34603421c4a0a4750e9856942d490aa1c0cc328af3e05d43c9e2b10425cd634540630e08f9cc1a050159116dd9e2b97c564e75e8e4470355a9455210a3297247c8935502378dd36c852d2007f95d0493b4e0772c87e2a4a93586c244b63350a44c7f3a0703f15f428ad1c4773d21397c473f8cb34c670805c2c05e41185538b86b56e1d091258e67228771d295bcd83e10d3003703c8a1710a378b320964599345a4af151004f4e83bd1a2b542268443283f2e8bb269452c85b4b18f3387c47ced36884278ac1707804cb25794a2350f0723c9e92218c7c2c4652a0cd1b4f02dc750bc58205e669058404dd179278d138228822d12d34870324da31d81454922a05337c3a18418060665452d0c8d512c892d03f501bf5206f07d1a3a5826a5212ac8c4d5b838c86104b0478c908c7f1b8934e169484c02ecfe3e1635c8ca5a56923cb12e8ee3bcee63cda37511459371444a234e64fcd12bc1308055344e634c49284a93a4e416cca58cf61285428c24218c4288c04b8e71ec82104ab1c92974d6d334692d89f20cb5634b518901540d94c4384c11c18c302395848c5d270933d902194a210c8b1f09b20520230b5324fc228b1278a0554f5389400fcd426cf53989f6651e1f1695d4ee47c801f8f73b4cd3643b2245921022260841a8542502f2f09f2a8c7384c75604f2e10f5189059d7f3ecc72488037dab310e957d0d308c30f8c733cf9434fd4b4fd19d24448ee27c30358e01c8a93f8fb54d74685854e91733c7e05cc523c572fcc12949b28d465f10c0f40b37caf3e9051c858244a93e8301548f525ce4f04529476374913a0");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment and emit the concated payload", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "000001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "boot");
        assert.equal(value.data.rebootReason, "CONFIGURATION_UPDATE");

        validateSchema(value.data, bootSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration status", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "1000a80007fe",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.temperature, 0);
        assert.equal(value.data.rssi, -88);
        assert.equal(value.data.loraTxCounter, 7);
        assert.equal(value.data.powerSupply, true);
        assert.equal(value.data.configuration, true);
        assert.equal(value.data.sensorConnection, true);
        assert.equal(value.data.sensorPaired, true);
        assert.equal(value.data.flashMemory, true);
        assert.equal(value.data.internalTemperatureSensor, true);
        assert.equal(value.data.timeSynchronized, true);

        validateSchema(value.data, statusSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration deactivation", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "3000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "deactivation");
        assert.equal(value.data.deactivationReason, "USER_TRIGGERED");

        validateSchema(value.data, deactivationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration boot", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "000008",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "boot");
        assert.equal(value.data.rebootReason, "POWER_BROWN_OUT");

        validateSchema(value.data, bootSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration measurement", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "10eb343d0a2448b14d5680",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "axis_x");
        assert.equal(value.data.temperature, -12);
        assert.equal(value.data.peakAcceleration, 0.035675048828125);
        assert.equal(value.data.rmsAcceleration, 0.01322174072265625);
        assert.equal(value.data.rmsVelocity, 0.33447265625);

        validateSchema(value.data, axisXSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration alert", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "2000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alert");
        assert.equal(value.data.sensorAlert0, false);
        assert.equal(value.data.sensorAlert1, false);
        assert.equal(value.data.sensorAlert2, false);
        assert.equal(value.data.sensorAlert3, false);
        assert.equal(value.data.sensorAlert4, false);
        assert.equal(value.data.sensorAlert5, false);
        assert.equal(value.data.sensorAlert6, false);
        assert.equal(value.data.sensorAlert7, false);

        assert.equal(value.data.spectrumAlert0, false);
        assert.equal(value.data.spectrumAlert1, false);
        assert.equal(value.data.spectrumAlert2, false);
        assert.equal(value.data.spectrumAlert3, false);
        assert.equal(value.data.spectrumAlert4, false);

        validateSchema(value.data, alertSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration machine fault", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "30ead7002914b676100207010100000001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "machine_fault");
        assert.equal(value.data.axis, "X");
        assert.equal(value.data.faultType, "COMMON_FAULT");
        assert.equal(value.data.faultCategory, "NONE");
        assert.deepEqual(value.data.harmonicFrequencies, [
          49.28125,
          98.5625,
          147.84375,
          197.125,
          246.40625,
          295.6875,
          344.96875,
          394.25,
          443.53125,
          492.8125
        ]);
        assert.deepEqual(value.data.harmonicAmplitudes, [
          0.40380859375,
          0.06334252450980392,
          0.00791781556372549,
          0.027712354473039217,
          0.003958907781862745,
          0.003958907781862745,
          0,
          0,
          0,
          0.003958907781862745
        ]);

        validateSchema(value.data, machineFaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration statistics", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "40000000000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "statistics");
        assert.equal(value.data.selection, "X_RMS_VELOCITY");
        assert.equal(value.data.min, 0);
        assert.equal(value.data.max, 0);
        assert.equal(value.data.avg, 0);

        validateSchema(value.data, statisticsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration spectrum", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "5064C800000193C00000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "axis_x_spectrum");
        assert.equal(value.data.spectrumType, "ACCELERATION");
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.rmsVelocity, 0);
        assert.equal(value.data.rmsAcceleration, 0);
        assert.equal(value.data.peakAcceleration, 0);
        assert.equal(value.data.rpm, 0);

        assert.deepEqual(value.data.frequencies, [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31
        ]);

        assert.deepEqual(value.data.magnitudes, [
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125
        ]);

        validateSchema(value.data, axisXspectrumSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      consume(data);
    });
  });
});