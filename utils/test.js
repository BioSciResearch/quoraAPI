const test = async (mod, req, tests) => {
  //console.log(mod)//req.main == mod)
  if (req.main === mod) {
    for([k, t] of Object.entries(tests)) {
      console.log(`\x1b[4mTest: ${k}\x1b[0m`)
      await t()
        .then(res=> console.log('\x1b[32msuccess\x1b[0m'))
        .catch(err => console.log(`\x1b[31mFAIL\x1b[0m\n${err}`))
    }
  }
}

exports.test = (module)=>test.bind(null, module, require)
