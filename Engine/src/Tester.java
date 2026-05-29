import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/** Code to test the Lexer works as intended. Modify as needed.
 *
 */
public class Tester {
    public static void main(String[] args) {
        String code3 = "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";
        String code = "test (x > 10) {_ y = x - null; } for //test\n _ _  _ \"a b c d\"";
        String code2 = "for (i = 0; i < 10; i++){\nx +=1;\nSystem.out.printLn(x);}";
        String code4 = "test (x > 10) {_ y = x - null; } ";
        String helloWorld = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        System.out.println(\"efghijklmnopqrstuvwxyz\\\\{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈ\\n\" +\n" +
                "            \"ÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùú\\n\" +\n" +
                "            \"ûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬ\\n\" +\n" +
                "            \"ĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞ\\n\" +\n" +
                "            \"şŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐ\\n\" +\n" +
                "            \"ƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂ\\n\" +\n" +
                "            \"ǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴ\\n\" +\n" +
                "            \"ǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦ\\n\" +\n" +
                "            \"ȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏɐɑɒɓɔɕɖɗɘ\\n\" +\n" +
                "            \"əɚɛɜɝɞɟɠɡɢɣɤɥɦɧɨɩɪɫɬɭɮɯɰɱɲɳɴɵɶɷɸɹɺɻɼɽɾɿʀʁʂʃʄʅʆʇʈʉʊ\\n\" +\n" +
                "            \"ʋʌʍʎʏʐʑʒʓʔʕʖʗʘʙʚʛʜʝʞʟʠʡʢʣʤʥʦʧʨʩʪʫʬʭʮʯʰʱʲʳʴʵʶʷʸʹʺʻʼ\\n\" +\n" +
                "            \"ʽʾʿˀˁ˂˃˄˅ˆˇˈˉˊˋˌˍˎˏːˑ˒˓˔˕˖˗˘˙˚˛˜˝˞˟ˠˡˢˣˤ˥˦˧˨˩˪˫ˬ˭ˮ\\n\" +\n" +
                "            \"˯˰˱˲˳˴˵˶˷˸˹˺˻˼˽˾˿̛̖̗̘̙̜̝̞̟̠̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̕̚\\n\" +\n" +
                "            \"̴̵̶̷̸̡̢̧̨̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎̽̾̿̀́͂̓̈́͆͊͋͌ͅ͏͐͑͒\\n\" +\n" +
                "            \"͓͔͕͖͙͚͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ͘͜͟͢͝͞͠͡ͰͱͲͳʹ͵Ͷͷͺͻͼͽ;Ϳ΄\\n\" +\n" +
                "            \"΅Ά·ΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζ\\n\" +\n" +
                "            \"ηθικλμνξοπρςστυφχψωϊϋόύώϏϐϑϒϓϔϕϖϗϘϙϚϛϜϝϞϟϠϡϢϣϤϥϦϧϨ\\n\" +\n" +
                "            \"ϩϪϫϬϭϮϯϰϱϲϳϴϵ϶ϷϸϹϺϻϼϽϾϿЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙК\\n\" +\n" +
                "            \"ЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыь\\n\" +\n" +
                "            \"эюяѐёђѓєѕіїјљњћќѝўџѠѡѢѣѤѥѦѧѨѩѪѫѬѭѮѯѰѱѲѳѴѵѶѷѸѹѺѻѼѽѾ\\n\" +\n" +
                "            \"ѿҀҁ҂҃҄҅҆҇҈҉ҊҋҌҍҎҏҐґҒғҔҕҖҗҘҙҚқҜҝҞҟҠҡҢңҤҥҦҧҨҩҪҫҬҭҮүҰ\\n\" +\n" +
                "            \"ұҲҳҴҵҶҷҸҹҺһҼҽҾҿӀӁӂӃӄӅӆӇӈӉӊӋӌӍӎӏӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӠӡӢ\\n\" +\n" +
                "            \"ӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹӺӻӼӽӾӿԀԁԂԃԄԅԆԇԈԉԊԋԌԍԎԏԐԑԒԓԔ\\n\" +\n" +
                "            \"ԕԖԗԘԙԚԛԜԝԞԟԠԡԢԣԤԥԦԧԨԩԪԫԬԭԮԯԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆ\\n\" +\n" +
                "            \"ՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖՙ՚՛՜՝՞՟ՠաբգդեզէըթժիլխծկհձղճմյնշո\\n\" +\n" +
                "            \"劣咽烈裂說廉念捻殮簾獵令囹寧嶺怜玲瑩羚聆鈴零靈領例禮醴隸惡了僚寮尿料樂燎療蓼遼龍暈阮劉杻柳流溜琉留硫\\n\" +\n" +
                "            \"紐類六戮陸倫崙淪輪律慄栗率隆利吏履易李梨泥理痢罹裏裡里離匿溺吝燐璘藺隣鱗麟林淋臨立笠粒狀炙識什茶刺切\\n\" +\n" +
                "            \"度拓糖宅洞暴輻行降見廓兀嗀﨎﨏塚﨑晴﨓﨔凞猪益礼神祥福靖精羽﨟蘒﨡諸﨣﨤逸都﨧﨨﨩飯飼館鶴郞隷侮僧免\\n\" +\n" +
                "            \"勉勤卑喝嘆器塀墨層屮悔慨憎懲敏既暑梅海渚漢煮爫琢碑社祉祈祐祖祝禍禎穀突節練縉繁署者臭艹艹著褐視謁謹賓\\n\" +\n" +
                "            \"贈辶逸難響頻恵𤋮舘並况全侀充冀勇勺喝啕喙嗢塚墳奄奔婢嬨廒廙彩徭惘慎愈憎慠懲戴揄搜摒敖晴朗望杖歹殺\\n\" +\n" +
                "            \"流滛滋漢瀞煮瞧爵犯猪瑱甆画瘝瘟益盛直睊着磌窱節类絛練缾者荒華蝹襁覆視調諸請謁諾諭謹變贈輸遲醙鉶陼難靖\\n\" +\n" +
                "            \"韛響頋頻鬒龜𢡊𢡄𣏕㮝䀘䀹𥉉𥳐𧻓齃龎ﬀﬁﬂﬃﬄﬅﬆﬓﬔﬕﬖﬗיִﬞײַﬠﬡﬢﬣﬤﬥﬦﬧﬨ﬩שׁשׂשּׁ\\n\" +\n" +
                "            \"שּׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּוֹבֿכֿפֿﭏﭐﭑﭒﭓﭔﭕﭖﭗﭘﭙﭚﭛﭜﭝﭞ\\n\" +\n" +
                "            \"ﭟﭠﭡﭢﭣﭤﭥﭦﭧﭨﭩﭪﭫﭬﭭﭮﭯﭰﭱﭲﭳﭴﭵﭶﭷﭸﭹﭺﭻﭼﭽﭾﭿﮀﮁﮂﮃﮄﮅﮆﮇﮈﮉﮊﮋﮌﮍﮎﮏﮐ\\n\" +\n" +
                "            \"ﮑﮒﮓﮔﮕﮖﮗﮘﮙﮚﮛﮜﮝﮞﮟﮠﮡﮢﮣﮤﮥﮦﮧﮨﮩﮪﮫﮬﮭﮮﮯﮰﮱ﮲﮳﮴﮵﮶﮷﮸﮹﮺﮻﮼﮽﮾﮿﯀﯁﯂\\n\" +\n" +
                "            \"ﯓﯔﯕﯖﯗﯘﯙﯚﯛﯜﯝﯞﯟﯠﯡﯢﯣﯤﯥﯦﯧﯨﯩﯪﯫﯬﯭﯮﯯﯰﯱﯲﯳﯴ\\n\" +\n" +
                "            \"ﯵﯶﯷﯸﯹﯺﯻﯼﯽﯾﯿﰀﰁﰂﰃﰄﰅﰆﰇﰈﰉﰊﰋﰌﰍﰎﰏﰐﰑﰒﰓﰔﰕﰖﰗﰘﰙﰚﰛﰜﰝﰞﰟﰠﰡﰢﰣﰤﰥﰦ\\n\" +\n" +
                "            \"ﰧﰨﰩﰪﰫﰬﰭﰮﰯﰰﰱﰲﰳﰴﰵﰶﰷﰸﰹﰺﰻﰼﰽﰾﰿﱀﱁﱂﱃﱄﱅﱆﱇﱈﱉﱊﱋﱌﱍﱎﱏﱐﱑﱒﱓﱔﱕﱖﱗﱘ\\n\" +\n" +
                "            \"ﱙﱚﱛﱜﱝﱞﱟﱠﱡﱢﱣﱤﱥﱦﱧﱨﱩﱪﱫﱬﱭﱮﱯﱰﱱﱲﱳﱴﱵﱶﱷﱸﱹﱺﱻﱼﱽﱾﱿﲀﲁﲂﲃﲄﲅﲆﲇﲈﲉﲊ\\n\" +\n" +
                "            \"ﲺﲻﲼ\\n\" +\n" +
                "            \"ﳫﳬﳭﳮ\\n\" +\n" +
                "            \"ﴟﴠ\\n\" +\n" +
                "            \"ﴡﴢﴣﴤﴥﴦﴧﴨﴩﴪﴫﴬﴭﴮﴯﴰﴱﴲﴳﴴﴵﴶﴷﴸﴹﴺﴻﴼﴽ﴾﴿﵀﵁﵂﵃﵄﵅﵆﵇﵈﵉﵊﵋﵌﵍﵎﵏ﵐﵑﵒ\\n\" +\n" +
                "            \"ﵓﵔﵕﵖﵗﵘﵙﵚﵛﵜﵝﵞﵟﵠﵡﵢﵣﵤﵥﵦﵧﵨﵩﵪﵫﵬﵭﵮﵯﵰﵱﵲﵳﵴﵵﵶﵷﵸﵹﵺﵻﵼﵽﵾﵿﶀﶁﶂﶃﶄ\\n\" +\n" +
                "            \"ﶅﶆﶇﶈﶉﶊﶋﶌﶍﶎﶏﶒﶓﶔﶕﶖﶗﶘﶙﶚﶛﶜﶝﶞﶟﶠﶡﶢﶣﶤﶥﶦﶧﶨﶩﶪﶫﶬﶭﶮﶯﶰﶱﶲﶳﶴﶵﶶ\\n\" +\n" +
                "            \"ﶷﶸﶹﶺﶻﶼﶽﶾﶿﷀﷁﷂﷃﷄﷅﷆﷇ﷏ﷰﷱﷲﷳﷴﷵﷶﷷﷸﷹﷺﷻ﷼﷽﷾﷿\\uFE00\\uFE01\\uFE02\\uFE03\\uFE04\\uFE05\\uFE06\\uFE07\\uFE08\\uFE09\\uFE0A\\uFE0B\\uFE0C\\uFE0D\\uFE0E\\uFE0F︐︑︒︓︔︕︖︗︘︙︧︨︩︪︫︬︭︠︡︢︣︤︥︦︮︯︰︱︲︳︴︵︶︷︸︹︺︻︼︽︾︿﹀﹁﹂﹃﹄﹅﹆﹇﹈﹉﹊﹋﹌\\n\" +\n" +
                "            \"﹍﹎﹏﹐﹑﹒﹔﹕﹖﹗﹘﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫ﹰﹱﹲﹳﹴﹶﹷﹸﹹﹺﹻﹼﹽﹾ\\n\" +\n" +
                "            \"ﹿﺀﺁﺂﺃﺄﺅﺆﺇﺈﺉﺊﺋﺌﺍﺎﺏﺐﺑﺒﺓﺔﺕﺖﺗﺘﺙﺚﺛﺜﺝﺞﺟﺠﺡﺢﺣﺤﺥﺦﺧﺨﺩﺪﺫﺬﺭﺮﺯﺰ\\n\" +\n" +
                "            \"ﺱﺲﺳﺴﺵﺶﺷﺸﺹﺺﺻﺼﺽﺾﺿﻀﻁﻂﻃﻄﻅﻆﻇﻈﻉﻊﻋﻌﻍﻎﻏﻐﻑﻒﻓﻔﻕﻖﻗﻘﻙﻚﻛﻜﻝﻞﻟﻠﻡﻢ\\n\" +\n" +
                "            \"ﻣﻤﻥﻦﻧﻨﻩﻪﻫﻬﻭﻮﻯﻰﻱﻲﻳﻴﻵﻶﻷﻸﻹﻺﻻﻼ！＂＃＄％＆＇（）＊＋，－．／０１２３４\\n\" +\n" +
                "            \"５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿｀ａｂｃｄｅｆ\\n\" +\n" +
                "            \"ｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～｟｠｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸ\\n\" +\n" +
                "            \"ｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟﾠﾡﾢﾣﾤﾥﾦﾧﾨﾩﾪ\\n\" +\n" +
                "            \"ﾫﾬﾭﾮﾯﾰﾱﾲﾳﾴﾵﾶﾷﾸﾹﾺﾻﾼﾽﾾￂￃￄￅￆￇￊￋￌￍￎￏￒￓￔￕￖￗￚￛￜ\\n\" +\n" +
                "            \"￠￡￢￣￤￥￦￨￩￪￫￬￭￮￼�\\uD800\\uDC00\\uD800\\uDC01\\uD800\\uDC02\\uD800\\uDC03\\uD800\\uDC04\\uD800\\uDC05\\uD800\\uDC06\\uD800\\uDC07\\uD800\\uDC08\\uD800\\uDC09\\uD800\\uDC0A\\uD800\\uDC0B\\uD800\\uDC0D\\uD800\\uDC0E\\n\" +\n" +
                "            \"\\uDB40\\uDD5B\\uDB40\\uDD5C\\uDB40\\uDD5D\\uDB40\\uDD5E\\uDB40\\uDD5F\\uDB40\\uDD60\\uDB40\\uDD61\\uDB40\\uDD62\\uDB40\\uDD63\\uDB40\\uDD64\\uDB40\\uDD65\\uDB40\\uDD66\\uDB40\\uDD67\\uDB40\\uDD68\\uDB40\\uDD69\\uDB40\\uDD6A\\uDB40\\uDD6B\\uDB40\\uDD6C\\uDB40\\uDD6D\\uDB40\\uDD6E\\uDB40\\uDD6F\\uDB40\\uDD70\\uDB40\\uDD71\\uDB40\\uDD72\\uDB40\\uDD73\\uDB40\\uDD74\\uDB40\\uDD75\\uDB40\\uDD76\\uDB40\\uDD77\\uDB40\\uDD78\\uDB40\\uDD79\\uDB40\\uDD7A\\uDB40\\uDD7B\\uDB40\\uDD7C\\uDB40\\uDD7D\\uDB40\\uDD7E\\uDB40\\uDD7F\\uDB40\\uDD80\\uDB40\\uDD81\\uDB40\\uDD82\\uDB40\\uDD83\\uDB40\\uDD84\\uDB40\\uDD85\\uDB40\\uDD86\\uDB40\\uDD87\\uDB40\\uDD88\\uDB40\\uDD89\\uDB40\\uDD8A\\uDB40\\uDD8B\\uDB40\\uDD8C\\n\" +\n" +
                "            \"\\uDB40\\uDD8D\\uDB40\\uDD8E\\uDB40\\uDD8F\\uDB40\\uDD90\\uDB40\\uDD91\\uDB40\\uDD92\\uDB40\\uDD93\\uDB40\\uDD94\\uDB40\\uDD95\\uDB40\\uDD96\\uDB40\\uDD97\\uDB40\\uDD98\\uDB40\\uDD99\\uDB40\\uDD9A\\uDB40\\uDD9B\\uDB40\\uDD9C\\uDB40\\uDD9D\\uDB40\\uDD9E\\uDB40\\uDD9F\\uDB40\\uDDA0\\uDB40\\uDDA1\\uDB40\\uDDA2\\uDB40\\uDDA3\\uDB40\\uDDA4\\uDB40\\uDDA5\\uDB40\\uDDA6\\uDB40\\uDDA7\\uDB40\\uDDA8\\uDB40\\uDDA9\\uDB40\\uDDAA\\uDB40\\uDDAB\\uDB40\\uDDAC\\uDB40\\uDDAD\\uDB40\\uDDAE\\uDB40\\uDDAF\\uDB40\\uDDB0\\uDB40\\uDDB1\\uDB40\\uDDB2\\uDB40\\uDDB3\\uDB40\\uDDB4\\uDB40\\uDDB5\\uDB40\\uDDB6\\uDB40\\uDDB7\\uDB40\\uDDB8\\uDB40\\uDDB9\\uDB40\\uDDBA\\uDB40\\uDDBB\\uDB40\\uDDBC\\uDB40\\uDDBD\\uDB40\\uDDBE\\n\" +\n" +
                "    }\n" +
                "}\n" +
                "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

        String hiWorld = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        // Prints \"Hi, World\" to the terminal window.\n" +
                "        System.out.print(\"Hi, World\");\n" +
                "}";

        String printsNumbers = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        // Prints \"Numbers 1 - 10\" to the terminal window.\n" +
                "        for (i = 0; i < 10; i++){\nx +=1;\nSystem.out.printLn(x);}" +
                "    }\n" +
                "}" +
                "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

        Lexer lexer_1 = new Lexer(helloWorld);
        Lexer lexer_2 = new Lexer(hiWorld);
        Lexer lexer_3 = new Lexer(code3);
        Lexer lexer_4 = new Lexer(printsNumbers);

        List<Token> tokens1 = lexer_1.tokenize();
        List<Token> copy1 = tokens1;
        List<Token> hiWorldTokens = lexer_2.tokenize();
        List<Token> code3Tokens = lexer_3.tokenize();
        List<Token> numberTokens = lexer_4.tokenize();

        /*System.out.println("Test 1: Two identical files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, copy1, 5));
        System.out.println(" ");

        System.out.println("Test 2: Two highly similar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, hiWorldTokens, 5));
        System.out.println(" ");

        System.out.println("Test 3: Two dissimilar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, code3Tokens, 5));
        System.out.println(" ");*/

        System.out.println("Test 4: Two somewhat similar files:");
        Token[] testTokens = ComparisonEngine.tokensToArray(tokens1);
        Token[] testTokens2 = ComparisonEngine.tokensToArray(numberTokens);
        //Submission testSub = new Submission(testTokens, 123123);
        //Submission testSub2 = new Submission(testTokens2, 456545);

        List<Submission> testSubList = new ArrayList<>();
        //testSubList.add(testSub2);

        //List<Sequence> testSequences = StringTiling.tile(testSub, testSubList, 5);
        //double testScore = SimilarityScore.getSimilarityScore(testTokens, testSequences);

        //ComparisonEngine.buildComparisonData(testSub, testSequences, testScore);

        System.out.println("Test 5: Evaluating tests 2 and 4 simultaneously:");
        //System.out.println(ComparisonEngine.compareDatabase(tokens1, multipleSubmissions, 5));

        SourceCode sourceCode;

        try{
            /*
            String sourceFile = "Engine/testFiles/VectorImp.java";
            FileHandler f = new FileHandler();
            File file = new File(sourceFile);
            sourceCode = f.getSourceCode(file);*/
            Lexer lexer = new Lexer(helloWorld);
            List<Token> tokens = lexer.tokenize();
            List<Token> copy = lexer.tokenize();
            //System.out.println(new ComparisonEngine().compare(code, code));

            for (Token token : tokens) {
                System.out.println(token);
            }

            //f.saveTokenList(tokens);
            //System.out.println(f.getTokensFromFile(new File("Engine/src/resources/tokens.csv")).toString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }





    }
}