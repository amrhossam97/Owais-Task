const removeLocalErrorMessage = (error) => {
  let e = '';
  if (error.response) {
    if(typeof error.response == 'string') e = error.response
    else if (typeof error.response.message != 'string')
      e = error.response.message[0];
    else e = error.response.message;
  } else if (error.message) e = error.message;

  if(!e) return 'Please Contact Support'
  return e
    .replace('HttpException:', '')
    .replace('Forbidden:', '')
    .replace('Bad Request:', '')
    .replace('Not Found:', '');
};

export const HandleErrorMessage = (error: any) => {
  return removeLocalErrorMessage(error);
  // return error
};
